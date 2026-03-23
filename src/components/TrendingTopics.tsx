import { TrendingUp, ArrowUpRight, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trendingTopics } from '@/data/mockEpubData';
import { cn } from '@/lib/utils';

interface TrendingTopicsProps {
  onTopicClick: (topic: string) => void;
  className?: string;
  compact?: boolean;
}

export function TrendingTopics({ onTopicClick, className, compact = false }: TrendingTopicsProps) {
  const displayTopics = compact ? trendingTopics.slice(0, 5) : trendingTopics;

  return (
    <Card className={cn("card-elevated", className)}>
      <CardHeader className={compact ? "pb-3" : "pb-4"}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
            <Flame className="h-4 w-4 text-warning" />
          </div>
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayTopics.map((item, index) => (
            <button
              key={item.topic}
              onClick={() => onTopicClick(item.topic)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-accent/10 hover:text-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-left">{item.topic}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="trending-badge">
                  <TrendingUp className="h-3 w-3" />
                  {item.growth}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
