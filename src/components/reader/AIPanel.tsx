import { useState, useCallback, useEffect } from 'react';
import { 
  Sparkles, Send, FileText, AlertCircle, BookOpen, 
  ClipboardList, Loader2, RefreshCw, Clock, Lock, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEnterprise } from '@/context/EnterpriseContext';
import { useUser } from '@/context/UserContext';
import { getRemainingAIQueries } from '@/data/complianceData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIPanelProps {
  chapterTitle: string;
  chapterContent: string;
  bookTitle: string;
  bookId: string;
  chapterId: string;
  onAIQuery: () => void;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'summary' | 'qa' | 'compliance' | 'general';
  responseTimeMs?: number;
}

export function AIPanel({ chapterTitle, chapterContent, bookTitle, bookId, chapterId, onAIQuery }: AIPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyQueryCount, setMonthlyQueryCount] = useState(0);
  const { toast } = useToast();
  const { currentTier, currentEnterprise, isEnterpriseMode } = useEnterprise();
  const { user } = useUser();

  // Fetch monthly AI query count
  useEffect(() => {
    async function fetchQueryCount() {
      if (!currentEnterprise) return;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count } = await supabase
        .from('ai_query_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());
      
      setMonthlyQueryCount(count || 0);
    }
    fetchQueryCount();
  }, [currentEnterprise]);

  const remainingQueries = currentTier 
    ? getRemainingAIQueries(currentTier.id, monthlyQueryCount)
    : Infinity;

  const isLimitReached = remainingQueries <= 0 && currentTier?.features.aiUsageMonthly !== -1;
  const monthlyLimit = currentTier?.features.aiUsageMonthly ?? -1;

  const quickActions = [
    { label: 'Summarize Chapter', icon: FileText, type: 'summary' as const, gated: false },
    { label: 'Key Clinical Points', icon: AlertCircle, type: 'compliance' as const, gated: !currentTier?.features.aiComplianceExtraction },
    { label: 'Drug Interactions', icon: ClipboardList, type: 'qa' as const, gated: false },
    { label: 'Study Guide', icon: BookOpen, type: 'general' as const, gated: false },
  ];

  const handleSubmit = useCallback(async (query: string, type?: AIMessage['type']) => {
    if (!query.trim() && !type) return;
    if (isLimitReached) {
      toast({ title: 'AI Limit Reached', description: 'Monthly AI query limit reached. Contact your administrator to upgrade.', variant: 'destructive' });
      return;
    }

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: type ? quickActions.find(a => a.type === type)?.label || query : query,
      type: type ?? 'general',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    onAIQuery();

    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt: query || undefined,
          chapterContent,
          chapterTitle,
          bookTitle,
          bookId,
          chapterId,
          type: type || 'default',
          userId: user.id || null,
          enterpriseId: user.enterpriseId || null,
        },
      });

      if (error) throw error;

      const aiMessage: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data?.content || 'No response received.',
        type: type ?? 'general',
        responseTimeMs: data?.responseTimeMs,
      };

      setMessages(prev => [...prev, aiMessage]);
      setMonthlyQueryCount(prev => prev + 1);
    } catch (err: any) {
      console.error('AI query failed:', err);
      const errorMsg = err?.message?.includes('429') 
        ? 'Rate limit exceeded. Please wait a moment and try again.'
        : err?.message?.includes('402')
        ? 'AI usage limit reached. Contact your administrator.'
        : 'Failed to get AI response. Please try again.';
      toast({ title: 'AI Error', description: errorMsg, variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [chapterContent, chapterTitle, bookTitle, bookId, chapterId, onAIQuery, toast, isLimitReached, quickActions]);

  const handleReset = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Assistant</p>
              <p className="text-[10px] text-muted-foreground">Compliance AI • Repository-Scoped</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        {/* Query usage bar */}
        {isEnterpriseMode && monthlyLimit !== -1 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{monthlyQueryCount} / {monthlyLimit} queries this month</span>
              <span className={remainingQueries <= 10 ? 'text-warning font-medium' : ''}>
                {remainingQueries} remaining
              </span>
            </div>
            <Progress 
              value={(monthlyQueryCount / monthlyLimit) * 100} 
              className="h-1.5"
            />
          </div>
        )}
        {isEnterpriseMode && monthlyLimit === -1 && (
          <p className="text-[10px] text-muted-foreground mt-1">Unlimited AI queries</p>
        )}
      </div>

      {/* Limit reached banner */}
      {isLimitReached && (
        <div className="p-3 bg-destructive/10 border-b border-destructive/20">
          <div className="flex items-center gap-2 text-xs text-destructive">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-medium">Monthly AI query limit reached.</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Contact your administrator to upgrade your plan for more queries.
          </p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center py-2">
              Ask questions about <span className="font-medium">{chapterTitle}</span> or use quick actions below
            </p>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.map(action => (
                <TooltipProvider key={action.type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9 gap-2 w-full"
                          disabled={action.gated || isLimitReached}
                          onClick={() => handleSubmit(action.label, action.type)}
                        >
                          <action.icon className={`h-3.5 w-3.5 ${action.gated ? 'text-muted-foreground' : 'text-accent'}`} />
                          {action.label}
                          {action.gated && <Crown className="h-3 w-3 text-warning ml-auto" />}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {action.gated && (
                      <TooltipContent>
                        <p className="text-xs">Requires Pro or Enterprise plan</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`text-sm rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary/10 ml-6'
                    : 'bg-muted/50 mr-2'
                }`}
              >
                {msg.role === 'user' && (
                  <Badge variant="secondary" className="text-[10px] mb-1">You</Badge>
                )}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-[10px] bg-accent/10 text-accent border-accent/20">AI</Badge>
                    {msg.responseTimeMs && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {(msg.responseTimeMs / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-xs leading-relaxed mt-1">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing with Compliance AI...
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <Textarea
            placeholder={isLimitReached ? "AI query limit reached" : "Ask about this chapter..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-xs min-h-[36px] max-h-[80px] resize-none"
            disabled={isLimitReached}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(input);
              }
            }}
          />
          <Button 
            size="icon" 
            className="h-9 w-9 flex-shrink-0"
            disabled={!input.trim() || isLoading || isLimitReached}
            onClick={() => handleSubmit(input)}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
