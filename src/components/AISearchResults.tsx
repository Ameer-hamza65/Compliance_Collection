import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Loader2, FolderOpen } from 'lucide-react';

interface AIRecommendation {
  bookId: string;
  title: string;
  reason: string;
  specialty: string;
  collection?: string | null;
  relevanceScore?: number;
}

interface AISearchResultsProps {
  recommendations: AIRecommendation[];
  loading: boolean;
  query: string;
  onViewBook: (bookId: string, title?: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-success/10 text-success border-success/20';
  if (score >= 50) return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-muted text-muted-foreground';
}

export function AISearchResults({ recommendations, loading, query, onViewBook }: AISearchResultsProps) {
  if (loading) {
    return (
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <div>
              <p className="font-medium text-sm">AI is analyzing your query...</p>
              <p className="text-xs text-muted-foreground">Searching across all compliance titles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <h3 className="font-semibold text-sm text-accent">AI Recommended</h3>
        <Badge variant="secondary" className="text-xs">Based on: "{query}"</Badge>
      </div>
      <div className="grid gap-3">
        {recommendations.map((rec) => (
          <Card key={rec.bookId} className="border-accent/10 hover:border-accent/30 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <BookOpen className="h-4 w-4 text-accent flex-shrink-0" />
                    <p className="font-medium text-sm truncate">{rec.title}</p>
                    {rec.relevanceScore != null && rec.relevanceScore > 0 && (
                      <Badge variant="outline" className={`text-xs ${getScoreColor(rec.relevanceScore)}`}>
                        {rec.relevanceScore}% match
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                <Button size="sm" variant="outline" onClick={() => onViewBook(rec.bookId, rec.title)} className="flex-shrink-0">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
