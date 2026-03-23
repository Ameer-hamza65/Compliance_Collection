import { useNavigate } from 'react-router-dom';
import { Bookmark, Share2, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EpubBook, Chapter, medicalTags } from '@/data/mockEpubData';
import { RelatedContent } from './RelatedContent';

interface ChapterReaderProps {
  book: EpubBook;
  chapter: Chapter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewChapter: (book: EpubBook, chapter: Chapter) => void;
}

export function ChapterReader({
  book,
  chapter,
  open,
  onOpenChange,
  onViewChapter,
}: ChapterReaderProps) {
  const navigate = useNavigate();

  const getTagLabel = (tagId: string) => {
    const tag = medicalTags.find(t => t.id === tagId);
    return tag?.name || tagId;
  };

  const currentIndex = book.tableOfContents.findIndex(c => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? book.tableOfContents[currentIndex - 1] : null;
  const nextChapter = currentIndex < book.tableOfContents.length - 1 ? book.tableOfContents[currentIndex + 1] : null;

  const handleOpenFullReader = () => {
    onOpenChange(false);
    navigate(`/reader?book=${book.id}&chapter=${chapter.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-10 rounded-full"
                style={{ backgroundColor: book.coverColor }}
              />
              <div>
                <p className="text-sm text-muted-foreground">{book.title}</p>
                <DialogTitle className="text-xl font-semibold">{chapter.title}</DialogTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Page {chapter.pageNumber}</Badge>
              <Button variant="ghost" size="icon" onClick={handleOpenFullReader} title="Open in Full Reader">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <ScrollArea className="flex-1 h-full">
            <div className="p-8 max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-6">
                {chapter.tags.map(tagId => (
                  <span key={tagId} className="medical-tag">
                    {getTagLabel(tagId)}
                  </span>
                ))}
              </div>

              <article className="prose prose-slate max-w-none">
                <p className="text-lg leading-relaxed text-foreground">
                  {chapter.content}
                </p>
                
                <p className="text-muted-foreground mt-6">
                  This is a preview. Open the full reader for highlighting, annotations, 
                  AI interaction, and chunk-level content navigation.
                </p>
                
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mt-6">
                  <h4 className="text-accent font-semibold mb-2">Full Reader Available</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    The enhanced content reader supports EPUB3-native rendering, highlighting, 
                    bookmarking, annotations, AI-powered summarization and Q&A, and 
                    institutional usage analytics.
                  </p>
                  <Button onClick={handleOpenFullReader} className="gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Open Full Reader
                  </Button>
                </div>
              </article>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                {prevChapter ? (
                  <Button variant="ghost" onClick={() => onViewChapter(book, prevChapter)} className="text-left">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    <div>
                      <p className="text-xs text-muted-foreground">Previous</p>
                      <p className="text-sm font-medium truncate max-w-48">{prevChapter.title}</p>
                    </div>
                  </Button>
                ) : <div />}
                
                {nextChapter ? (
                  <Button variant="ghost" onClick={() => onViewChapter(book, nextChapter)} className="text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Next</p>
                      <p className="text-sm font-medium truncate max-w-48">{nextChapter.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : <div />}
              </div>
            </div>
          </ScrollArea>

          <div className="hidden lg:block w-80 border-l border-border/50 bg-muted/30">
            <ScrollArea className="h-full p-4">
              <RelatedContent
                currentChapterId={chapter.id}
                onViewChapter={onViewChapter}
              />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
