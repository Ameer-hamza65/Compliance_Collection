import { Highlighter, MessageSquare, Trash2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Highlight, Annotation, Bookmark as BookmarkType } from '@/hooks/useAnnotations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HighlightsPanelProps {
  highlights: Highlight[];
  annotations: Annotation[];
  bookmarks: BookmarkType[];
  highlightColors: string[];
  activeColor: string;
  onColorChange: (color: string) => void;
  onRemoveHighlight: (id: string) => void;
  onRemoveAnnotation: (id: string) => void;
  onJumpToChunk: (chunkIndex: number) => void;
}

export function HighlightsPanel({
  highlights,
  annotations,
  bookmarks,
  highlightColors,
  activeColor,
  onColorChange,
  onRemoveHighlight,
  onRemoveAnnotation,
  onJumpToChunk,
}: HighlightsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
            <Highlighter className="h-4 w-4 text-warning" />
          </div>
          <p className="text-sm font-semibold">Notes & Highlights</p>
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-muted-foreground">Highlight color:</span>
          <div className="flex gap-1.5">
            {highlightColors.map(color => (
              <button
                key={color}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  activeColor === color ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="highlights" className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2 grid grid-cols-3 h-8">
          <TabsTrigger value="highlights" className="text-[10px] h-6">
            Highlights ({highlights.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-[10px] h-6">
            Notes ({annotations.length})
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="text-[10px] h-6">
            Marks ({bookmarks.length})
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-3">
          <TabsContent value="highlights" className="mt-0 space-y-2">
            {highlights.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Select text in the reader to create highlights
              </p>
            ) : (
              highlights.map(hl => (
                <div key={hl.id} className="p-2 rounded-lg bg-muted/30 border border-border/50 group">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 text-xs leading-relaxed cursor-pointer"
                      onClick={() => onJumpToChunk(hl.chunkIndex)}
                    >
                      <span
                        className="px-1 rounded"
                        style={{ backgroundColor: hl.color }}
                      >
                        {hl.text.slice(0, 80)}{hl.text.length > 80 ? '...' : ''}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={() => onRemoveHighlight(hl.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">§{hl.chunkIndex + 1}</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-0 space-y-2">
            {annotations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Select text and click "Annotate" to add notes
              </p>
            ) : (
              annotations.map(an => (
                <div key={an.id} className="p-2 rounded-lg bg-muted/30 border border-border/50 group">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => onJumpToChunk(an.chunkIndex)}
                    >
                      <p className="text-[10px] text-muted-foreground italic">"{an.text.slice(0, 40)}..."</p>
                      <p className="text-xs text-foreground mt-1">{an.note}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={() => onRemoveAnnotation(an.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">§{an.chunkIndex + 1}</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-0 space-y-2">
            {bookmarks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Bookmark chapters for quick access
              </p>
            ) : (
              bookmarks.map(bm => (
                <div key={bm.id} className="p-2 rounded-lg bg-muted/30 border border-border/50 flex items-start gap-2">
                  <Bookmark className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">{bm.chapterTitle}</p>
                    <p className="text-[10px] text-muted-foreground">{bm.bookTitle}</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
