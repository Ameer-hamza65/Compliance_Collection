import { useState, useCallback, useMemo } from 'react';
import { Search, Sparkles, Loader2, BookOpen, FileText, ArrowRight, ArrowLeft, X, PanelRightClose } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar, SearchFilters } from '@/components/SearchBar';
import { ContentRenderer } from '@/components/reader/ContentRenderer';
import { chunkChapterContent } from '@/lib/chunkContent';
import { supabase } from '@/integrations/supabase/client';
import { useBooks } from '@/context/BookContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import type { Chapter } from '@/data/mockEpubData';

interface SplitSearchPanelProps {
  currentBookId: string;
  currentChapterId: string;
  onNavigateChapter: (bookId: string, chapterId: string) => void;
  onClose: () => void;
}

interface SearchResult {
  bookId: string;
  title: string;
  reason: string;
  specialty: string;
  collection?: string | null;
  relevanceScore?: number;
  chapters?: Array<{ id: string; title: string; reason: string }>;
}

/** Content being previewed in the right panel */
interface PreviewContent {
  bookId: string;
  bookTitle: string;
  chapter: Chapter;
}

export function SplitSearchPanel({ currentBookId, currentChapterId, onNavigateChapter, onClose }: SplitSearchPanelProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [preview, setPreview] = useState<PreviewContent | null>(null);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number | null>(null);
  const { books } = useBooks();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSearch = useCallback(async (query: string, filters?: SearchFilters) => {
    if (!query.trim()) return;

    setHasSearched(true);
    setLoading(true);
    setResults([]);
    setPreview(null); // close any open preview when searching

    try {
      const bookCatalog = books.map(b => ({
        id: b.id,
        title: b.title,
        specialty: b.specialty,
        publisher: b.publisher,
        edition: b.edition,
        description: b.description?.slice(0, 200) || '',
        tags: b.tags?.slice(0, 8) || [],
        year: b.publishedYear,
        chapters: b.tableOfContents.slice(0, 15).map(ch => ({ id: ch.id, title: ch.title })),
      }));

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt: query,
          filters,
          chapterContent: JSON.stringify(bookCatalog),
          chapterTitle: 'Book Catalog',
          bookTitle: 'Compliance Collections Library',
          type: 'search',
          userId: user.id || null,
          enterpriseId: user.enterpriseId || null,
        },
      });

      if (error) {
        toast({ title: 'Search Error', description: 'Failed to search. Try again.', variant: 'destructive' });
        return;
      }

      if (data?.results && Array.isArray(data.results)) {
        setResults(data.results.slice(0, 8).map((r: any) => ({
          bookId: r.bookId || '',
          title: r.title || '',
          reason: r.reason || '',
          specialty: r.specialty || '',
          collection: r.collection || null,
          relevanceScore: r.relevanceScore || 0,
          chapters: r.chapters || [],
        })));
      }
    } catch {
      toast({ title: 'Search Error', description: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [books, user.id, user.enterpriseId, toast]);

  /** Open a chapter's content inline in the right panel */
  const handleOpenPreview = useCallback((bookId: string, chapterId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const chapter = book.tableOfContents.find(c => c.id === chapterId);
    if (!chapter) return;

    setPreview({ bookId, bookTitle: book.title, chapter });
    setActiveChunkIndex(null);
  }, [books]);

  /** Navigate the LEFT panel to this chapter (full reader navigation) */
  const handleOpenInReader = useCallback(() => {
    if (!preview) return;
    onNavigateChapter(preview.bookId, preview.chapter.id);
    setPreview(null);
  }, [preview, onNavigateChapter]);

  const previewChunks = useMemo(() => {
    if (!preview?.chapter?.content) return [];
    return chunkChapterContent(preview.chapter.id, preview.chapter.content);
  }, [preview]);

  const currentBook = books.find(b => b.id === currentBookId);

  // ── Preview mode: show chapter content inside right panel ──
  if (preview) {
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Preview header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
          <Button variant="ghost" size="sm" className="gap-1 h-7 px-2" onClick={() => setPreview(null)}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-xs">Back</span>
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground truncate">{preview.bookTitle}</p>
            <p className="text-xs font-semibold text-foreground truncate">{preview.chapter.title}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1 h-7 px-2 text-xs" onClick={handleOpenInReader}>
            <PanelRightClose className="h-3.5 w-3.5" />
            Open in Reader
          </Button>
        </div>

        {/* Chapter content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {preview.chapter.tags && preview.chapter.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {preview.chapter.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            )}
            {previewChunks.length > 0 ? (
              <ContentRenderer
                chunks={previewChunks}
                fontSize={14}
                highlights={[]}
                annotations={[]}
                activeChunkIndex={activeChunkIndex}
                onChunkClick={setActiveChunkIndex}
                onHighlight={() => {}}
                onAnnotate={() => {}}
                highlightColor="#fde68a"
              />
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No content available for this chapter.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ── Default mode: search & related content tabs ──
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">Search & Resources</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="search" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 mt-2 mb-0">
          <TabsTrigger value="search" className="text-xs">AI Search</TabsTrigger>
          <TabsTrigger value="related" className="text-xs">Related Content</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
          <div className="p-3 border-b border-border/50">
            <SearchBar onSearch={handleSearch} showFilters={true} />
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {loading && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="h-6 w-6 text-accent animate-spin" />
                  <p className="text-sm text-muted-foreground">Searching with AI...</p>
                </div>
              )}

              {!loading && hasSearched && results.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No results found. Try different terms.</p>
                </div>
              )}

              {!loading && results.map((result, i) => (
                <Card key={result.bookId + i} className="overflow-hidden hover:border-accent/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <BookOpen className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                        <h4 className="text-xs font-semibold text-foreground truncate">{result.title}</h4>
                      </div>
                      {result.relevanceScore != null && result.relevanceScore > 0 && (
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {result.relevanceScore}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">{result.reason}</p>
                    
                    {result.chapters && result.chapters.length > 0 && (
                      <div className="space-y-1">
                        {result.chapters.slice(0, 3).map((ch, ci) => (
                          <button
                            key={ch.id + ci}
                            onClick={() => handleOpenPreview(result.bookId, ch.id)}
                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md hover:bg-accent/5 transition-colors group"
                          >
                            <FileText className="h-3 w-3 text-accent flex-shrink-0" />
                            <span className="text-[11px] font-medium truncate group-hover:text-accent transition-colors">
                              {ch.title}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="related" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {currentBook && (
                <>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Chapters in this book</p>
                  {currentBook.tableOfContents.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleOpenPreview(currentBookId, ch.id)}
                      className={`flex items-start gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        ch.id === currentChapterId
                          ? 'bg-accent/10 border border-accent/20'
                          : 'hover:bg-secondary/50'
                      }`}
                    >
                      <FileText className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                        ch.id === currentChapterId ? 'text-accent' : 'text-muted-foreground'
                      }`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${
                          ch.id === currentChapterId ? 'text-accent' : 'text-foreground'
                        }`}>
                          {ch.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
