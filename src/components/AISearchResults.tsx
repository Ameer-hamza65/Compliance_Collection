import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Loader2, FolderOpen, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIRecommendation {
  bookId: string;
  title: string;
  reason: string;
  specialty: string;
  collection?: string | null;
  relevanceScore?: number;
  chapters?: Array<{ id: string; title: string; reason: string }>;
}

interface AISearchResultsProps {
  recommendations: AIRecommendation[];
  loading: boolean;
  query: string;
  onViewBook: (bookId: string, title?: string) => void;
  onViewChapter?: (bookId: string, chapterId: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-success/10 text-success border-success/20';
  if (score >= 50) return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-muted text-muted-foreground';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Highly Relevant';
  if (score >= 70) return 'Relevant';
  if (score >= 50) return 'Partial Match';
  return 'Related';
}

export function AISearchResults({ recommendations, loading, query, onViewBook, onViewChapter }: AISearchResultsProps) {
  if (loading) {
    return (
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">AI is analyzing your query...</p>
              <p className="text-sm text-muted-foreground mt-1">Searching across all compliance titles and chapters</p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-accent animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">AI Search Results</h3>
          <p className="text-xs text-muted-foreground">
            {recommendations.length} result{recommendations.length !== 1 ? 's' : ''} for "{query}"
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.bookId + index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <Card className="overflow-hidden hover:border-accent/30 transition-all duration-200 group">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Accent bar */}
                  <div className="w-1.5 flex-shrink-0 bg-accent/40 group-hover:bg-accent transition-colors" />
                  
                  <div className="flex-1 p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <BookOpen className="h-4 w-4 text-accent flex-shrink-0" />
                          <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                            {rec.title}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {rec.relevanceScore != null && rec.relevanceScore > 0 && (
                            <Badge variant="outline" className={`text-xs ${getScoreColor(rec.relevanceScore)}`}>
                              {rec.relevanceScore}% — {getScoreLabel(rec.relevanceScore)}
                            </Badge>
                          )}
                          {rec.collection && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {rec.collection}
                            </Badge>
                          )}
                          {rec.specialty && (
                            <Badge variant="secondary" className="text-xs">{rec.specialty}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onViewBook(rec.bookId, rec.title)}
                        className="flex-shrink-0"
                      >
                        Open
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>

                    {/* AI Reasoning */}
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{rec.reason}</p>

                    {/* Chapter matches */}
                    {rec.chapters && rec.chapters.length > 0 && (
                      <div className="border-t border-border/50 pt-3 mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Relevant Chapters:</p>
                        <div className="space-y-1.5">
                          {rec.chapters.slice(0, 3).map((ch, ci) => (
                            <button
                              key={ch.id + ci}
                              onClick={() => onViewChapter?.(rec.bookId, ch.id)}
                              className="flex items-start gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-accent/5 transition-colors group/ch"
                            >
                              <FileText className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground group-hover/ch:text-accent transition-colors truncate">
                                  {ch.title}
                                </p>
                                {ch.reason && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{ch.reason}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
