import { 
  Clock, Eye, Highlighter, MessageSquare, Bookmark, 
  Search, Sparkles, BarChart3, Activity 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReadingStats } from '@/hooks/useReadingSession';

interface AnalyticsPanelProps {
  stats: ReadingStats;
  formattedTime: string;
  totalChunks: number;
  viewedChunks: number;
  bookTitle: string;
  chapterTitle: string;
}

export function AnalyticsPanel({ 
  stats, 
  formattedTime, 
  totalChunks, 
  viewedChunks,
  bookTitle,
  chapterTitle,
}: AnalyticsPanelProps) {
  const progressPercent = totalChunks > 0 ? Math.round((viewedChunks / totalChunks) * 100) : 0;

  const statItems = [
    { label: 'Reading Time', value: formattedTime, icon: Clock, color: 'text-accent' },
    { label: 'Sections Viewed', value: `${viewedChunks}/${totalChunks}`, icon: Eye, color: 'text-primary' },
    { label: 'Highlights', value: stats.highlightsCreated.toString(), icon: Highlighter, color: 'text-warning' },
    { label: 'Annotations', value: stats.annotationsCreated.toString(), icon: MessageSquare, color: 'text-accent' },
    { label: 'Bookmarks', value: stats.bookmarksCreated.toString(), icon: Bookmark, color: 'text-warning' },
    { label: 'AI Queries', value: stats.aiQueriesUsed.toString(), icon: Sparkles, color: 'text-accent' },
  ];

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
          <BarChart3 className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold">Reading Analytics</p>
          <p className="text-[10px] text-muted-foreground">Session tracking</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Chapter Progress</span>
            <span className="text-xs text-accent font-semibold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-[10px] text-muted-foreground mt-1 truncate">{chapterTitle}</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {statItems.map(item => (
          <Card key={item.label} className="bg-muted/30 border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
              <div className="min-w-0">
                <p className="text-sm font-bold">{item.value}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Enterprise Audit Trail</span>
        </div>
        <div className="space-y-1.5 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
            <Clock className="h-3 w-3" />
            <span>Session started at {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
            <Eye className="h-3 w-3" />
            <span>{viewedChunks} content sections accessed</span>
          </div>
          {stats.highlightsCreated > 0 && (
            <div className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
              <Highlighter className="h-3 w-3" />
              <span>{stats.highlightsCreated} highlights created</span>
            </div>
          )}
          {stats.aiQueriesUsed > 0 && (
            <div className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
              <Sparkles className="h-3 w-3" />
              <span>{stats.aiQueriesUsed} AI queries performed</span>
            </div>
          )}
        </div>
      </div>

      {/* Compliance note */}
      <div className="p-2 bg-accent/5 border border-accent/20 rounded text-[10px] text-muted-foreground">
        <p className="font-medium text-accent mb-0.5">Enterprise Compliance</p>
        <p>All reading activity is tracked for institutional audit compliance. Access logs include content-level tracking per OpenAthens/SSO session requirements.</p>
      </div>
    </div>
  );
}
