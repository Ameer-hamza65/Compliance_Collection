import { Book, ChevronRight, ChevronDown, CheckCircle2, BookOpen, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EpubBook, Chapter, medicalTags } from '@/data/mockEpubData';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

  // Group chapters by category
  const frontMatter = book.tableOfContents.filter(ch => ch.category === 'front-matter');
  const mainChapters = book.tableOfContents.filter(ch => !ch.category || ch.category === 'chapter');
  const appendix = book.tableOfContents.filter(ch => ch.category === 'appendix');

  const [frontMatterOpen, setFrontMatterOpen] = useState(false);
  const [appendixOpen, setAppendixOpen] = useState(false);

  const renderChapterButton = (chapter: Chapter, idx: number, showNumber = true) => {
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
          {showNumber && (
            <span className={cn(
              'text-[10px] font-mono mt-0.5 flex-shrink-0',
              isCurrent ? 'text-accent' : 'text-muted-foreground'
            )}>
              {String(idx + 1).padStart(2, '0')}
            </span>
          )}
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
  };

  const hasFrontMatter = frontMatter.length > 0;
  const hasAppendix = appendix.length > 0;

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
            <p className="text-[10px] text-muted-foreground">{mainChapters.length} chapters</p>
          </div>
        </div>
      </div>

      {/* Chapters grouped by category */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Book Info link */}
          <button
            onClick={() => onSelectChapter({ id: '__book-info__', title: 'Book Information', content: '', pageNumber: 0, tags: [] })}
            className={cn(
              'w-full text-left p-2.5 rounded-lg transition-colors',
              currentChapterId === '__book-info__'
                ? 'bg-accent/10 border border-accent/20'
                : 'hover:bg-muted/50'
            )}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs font-semibold text-foreground">Book Information</p>
            </div>
          </button>

          {/* Front Matter (collapsible) */}
          {hasFrontMatter && (
            <Collapsible open={frontMatterOpen} onOpenChange={setFrontMatterOpen}>
              <CollapsibleTrigger className="w-full flex items-center gap-1.5 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                {frontMatterOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <FileText className="h-3 w-3" />
                Front Matter ({frontMatter.length})
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-2 space-y-0.5">
                  {frontMatter.map((ch, idx) => renderChapterButton(ch, idx, false))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Main Chapters */}
          <div className="px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Chapters ({mainChapters.length})
            </p>
          </div>
          {mainChapters.map((chapter, idx) => renderChapterButton(chapter, idx))}

          {/* Appendix (collapsible) */}
          {hasAppendix && (
            <Collapsible open={appendixOpen} onOpenChange={setAppendixOpen}>
              <CollapsibleTrigger className="w-full flex items-center gap-1.5 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                {appendixOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Appendix ({appendix.length})
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-2 space-y-0.5">
                  {appendix.map((ch, idx) => renderChapterButton(ch, idx, false))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
