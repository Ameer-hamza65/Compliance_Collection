import { useState, useRef, useCallback } from 'react';
import { 
  AlertTriangle, Pill, ClipboardList, Lightbulb, 
  Highlighter, MessageSquarePlus, ChevronRight 
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

const chunkIcons: Record<ContentChunk['type'], typeof Lightbulb> = {
  'heading': ChevronRight,
  'paragraph': ChevronRight,
  'clinical-pearl': Lightbulb,
  'key-point': AlertTriangle,
  'procedure-step': ClipboardList,
  'drug-info': Pill,
  'reference': ChevronRight,
};

const chunkStyles: Record<ContentChunk['type'], string> = {
  'heading': 'font-bold text-lg',
  'paragraph': '',
  'clinical-pearl': 'bg-warning/5 border-l-4 border-warning/40 pl-4 py-3 rounded-r-lg',
  'key-point': 'bg-accent/5 border-l-4 border-accent/40 pl-4 py-3 rounded-r-lg',
  'procedure-step': 'bg-primary/5 border-l-4 border-primary/40 pl-4 py-3 rounded-r-lg',
  'drug-info': 'bg-destructive/5 border-l-4 border-destructive/30 pl-4 py-3 rounded-r-lg',
  'reference': 'text-sm text-muted-foreground italic',
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

  const highlightTextInContent = (text: string, chunkHighlights: Highlight[]) => {
    if (chunkHighlights.length === 0) return text;
    
    let result = text;
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
    <div ref={contentRef} className="max-w-3xl mx-auto space-y-4">
      {chunks.map((chunk, idx) => {
        const Icon = chunkIcons[chunk.type];
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
              chunk.type === 'paragraph' && 'hover:bg-muted/30 px-2 py-1'
            )}
            onClick={() => onChunkClick(idx)}
            onMouseUp={() => handleTextSelect(idx)}
          >
            {/* Chunk type label */}
            {chunk.label && (
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {chunk.label}
                </span>
              </div>
            )}

            {/* Content with highlights */}
            <p
              className="leading-relaxed text-foreground"
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
