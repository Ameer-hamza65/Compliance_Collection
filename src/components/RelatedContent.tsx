import { Link2, Book, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EpubBook, Chapter, getRelatedChapters } from '@/data/mockEpubData';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

interface RelatedContentProps {
  currentChapterId: string;
  onViewChapter: (book: EpubBook, chapter: Chapter) => void;
  className?: string;
}

export function RelatedContent({
  currentChapterId,
  onViewChapter,
  className,
}: RelatedContentProps) {
  const { hasFullAccess } = useUser();
  const related = getRelatedChapters(currentChapterId, 5);

  if (related.length === 0) return null;

  const accessibleContent = related.filter(r => hasFullAccess(r.book.id));
  const restrictedContent = related.filter(r => !hasFullAccess(r.book.id));

  return (
    <Card className={cn("card-elevated", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Link2 className="h-4 w-4 text-accent" />
          </div>
          Related Content
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {accessibleContent.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              In Your Library
            </p>
            {accessibleContent.map(({ book, chapter }) => (
              <button
                key={`${book.id}-${chapter.id}`}
                onClick={() => onViewChapter(book, chapter)}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex gap-3">
                  <div
                    className="w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: book.coverColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                      {chapter.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Book className="h-3 w-3" />
                      {book.title}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}

        {restrictedContent.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Institutional Access Required
            </p>
            {restrictedContent.map(({ book, chapter }) => (
              <div
                key={`${book.id}-${chapter.id}`}
                className="p-3 rounded-lg bg-muted/50 opacity-60"
              >
                <div className="flex gap-3">
                  <div
                    className="w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: book.coverColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {chapter.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Book className="h-3 w-3" />
                      {book.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
