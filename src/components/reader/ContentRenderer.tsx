import { useState, useRef, useCallback } from 'react';
import { 
  Highlighter, MessageSquarePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ContentChunk } from '@/lib/chunkContent';
import { Highlight, Annotation } from '@/hooks/useAnnotations';
import { cn } from '@/lib/utils';

interface ContentRendererProps {
  chunks: ContentChunk[];
  fontSize: number;
  highlights: Highlight[];
  annotations: Annotation[];
  activeChunkIndex: number | null;
  onChunkClick: (index: number) => void;
  onHighlight: (text: string, chunkIndex: number) => void;
  onAnnotate: (text: string, note: string, chunkIndex: number) => void;
  highlightColor: string;
}

const chunkStyles: Record<ContentChunk['type'], string> = {
  'heading': '',
  'paragraph': '',
  'list': '',
  'table': '',
  'blockquote': 'border-l-4 border-accent/40 pl-4 py-2 bg-accent/5 rounded-r-lg',
  'figure': 'my-4',
  'code': 'bg-muted/50 rounded-lg p-4 overflow-x-auto',
  'other': '',
};

export function ContentRenderer({
  chunks,
  fontSize,
  highlights,
  annotations,
  activeChunkIndex,
  onChunkClick,
  onHighlight,
  onAnnotate,
  highlightColor,
}: ContentRendererProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotateForm, setShowAnnotateForm] = useState<number | null>(null);
  const [annotationNote, setAnnotationNote] = useState('');
  const [popoverChunk, setPopoverChunk] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTextSelect = useCallback((chunkIndex: number) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setPopoverChunk(chunkIndex);
    }
  }, []);

  const handleHighlight = useCallback(() => {
    if (selectedText && popoverChunk !== null) {
      onHighlight(selectedText, popoverChunk);
      setSelectedText('');
      setPopoverChunk(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [selectedText, popoverChunk, onHighlight]);

  const handleAnnotateSubmit = useCallback((chunkIndex: number) => {
    if (selectedText && annotationNote.trim()) {
      onAnnotate(selectedText, annotationNote.trim(), chunkIndex);
      setAnnotationNote('');
      setShowAnnotateForm(null);
      setSelectedText('');
      setPopoverChunk(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [selectedText, annotationNote, onAnnotate]);

  const getChunkHighlights = (chunkIndex: number) => {
    return highlights.filter(h => h.chunkIndex === chunkIndex);
  };

  const getChunkAnnotations = (chunkIndex: number) => {
    return annotations.filter(a => a.chunkIndex === chunkIndex);
  };

  const highlightTextInContent = (html: string, chunkHighlights: Highlight[]) => {
    if (chunkHighlights.length === 0) return html;
    
    let result = html;
    chunkHighlights.forEach(hl => {
      const escaped = hl.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(
        new RegExp(`(${escaped})`, 'gi'),
        `<mark style="background-color: ${hl.color}; padding: 1px 2px; border-radius: 2px;">$1</mark>`
      );
    });
    return result;
  };

  return (
    <div ref={contentRef} className="max-w-3xl mx-auto space-y-1">
      {chunks.map((chunk, idx) => {
        const chunkHls = getChunkHighlights(idx);
        const chunkAns = getChunkAnnotations(idx);
        const isActive = activeChunkIndex === idx;

        return (
          <div
            key={chunk.id}
            id={`chunk-${idx}`}
            data-chunk-index={idx}
            className={cn(
              'relative group rounded-lg transition-all duration-200 cursor-pointer',
              chunkStyles[chunk.type],
              isActive && 'ring-2 ring-accent/30 bg-accent/5',
              (chunk.type === 'paragraph' || chunk.type === 'list') && 'hover:bg-muted/30 px-2 py-0.5'
            )}
            onClick={() => onChunkClick(idx)}
            onMouseUp={() => handleTextSelect(idx)}
          >
            {/* Chunk label */}
            {chunk.label && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {chunk.label}
                </span>
              </div>
            )}

            {/* HTML content with prose styling */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                prose-p:text-foreground prose-p:leading-relaxed prose-p:my-1
                prose-li:text-foreground
                prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground
                prose-table:border-border prose-th:border-border prose-td:border-border
                prose-blockquote:text-foreground prose-blockquote:border-accent/40
                prose-strong:text-foreground prose-em:text-foreground
                prose-a:text-primary prose-a:underline
                prose-img:rounded-lg prose-img:max-w-full
                prose-code:text-foreground prose-pre:bg-muted/50"
              style={{ fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{
                __html: highlightTextInContent(chunk.content, chunkHls),
              }}
            />

            {/* Selection popup */}
            {popoverChunk === idx && selectedText && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-1 z-10 animate-scale-in">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1"
                  onClick={handleHighlight}
                >
                  <Highlighter className="h-3 w-3" />
                  Highlight
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowAnnotateForm(idx)}
                >
                  <MessageSquarePlus className="h-3 w-3" />
                  Annotate
                </Button>
              </div>
            )}

            {/* Annotation form */}
            {showAnnotateForm === idx && (
              <div className="mt-3 p-3 bg-card border border-border rounded-lg space-y-2 animate-fade-in">
                <p className="text-xs text-muted-foreground">
                  Annotating: "<span className="italic">{selectedText.slice(0, 60)}...</span>"
                </p>
                <Textarea
                  placeholder="Add your note..."
                  value={annotationNote}
                  onChange={(e) => setAnnotationNote(e.target.value)}
                  className="text-sm min-h-[60px]"
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setShowAnnotateForm(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleAnnotateSubmit(idx)}>
                    Save Note
                  </Button>
                </div>
              </div>
            )}

            {/* Inline annotations */}
            {chunkAns.length > 0 && (
              <div className="mt-2 space-y-1">
                {chunkAns.map(an => (
                  <div key={an.id} className="flex items-start gap-2 p-2 bg-accent/5 rounded border border-accent/20 text-xs">
                    <MessageSquarePlus className="h-3 w-3 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground italic">"{an.text.slice(0, 50)}..."</p>
                      <p className="text-foreground mt-0.5">{an.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chunk index indicator */}
            <span className="absolute -left-6 top-1 text-[10px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
              §{idx + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
