import { Book, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EpubBook, Chapter, medicalTags } from '@/data/mockEpubData';
import { cn } from '@/lib/utils';

interface TOCPanelProps {
  book: EpubBook;
  currentChapterId: string;
  onSelectChapter: (chapter: Chapter) => void;
}

export function TOCPanel({ book, currentChapterId, onSelectChapter }: TOCPanelProps) {
  const getTagLabel = (tagId: string) => {
    const tag = medicalTags.find(t => t.id === tagId);
    return tag?.name || tagId;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Book Info */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
            style={{ backgroundColor: book.coverColor }}
          >
            <Book className="h-4 w-4 text-white/30" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{book.title}</p>
            <p className="text-[10px] text-muted-foreground">{book.tableOfContents.length} chapters</p>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {book.tableOfContents.map((chapter, idx) => {
            const isCurrent = chapter.id === currentChapterId;
            return (
              <button
                key={chapter.id}
                onClick={() => onSelectChapter(chapter)}
                className={cn(
                  'w-full text-left p-2.5 rounded-lg transition-colors group',
                  isCurrent 
                    ? 'bg-accent/10 border border-accent/20' 
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-start gap-2">
                  <span className={cn(
                    'text-[10px] font-mono mt-0.5 flex-shrink-0',
                    isCurrent ? 'text-accent' : 'text-muted-foreground'
                  )}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs font-medium line-clamp-2',
                      isCurrent ? 'text-accent' : 'text-foreground'
                    )}>
                      {chapter.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="secondary" className="text-[9px] h-4">
                        p.{chapter.pageNumber}
                      </Badge>
                      {chapter.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] text-muted-foreground">
                          {getTagLabel(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isCurrent && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
