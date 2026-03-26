import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { ContentRenderer } from '@/components/reader/ContentRenderer';
import { BookInfoPage } from '@/components/reader/BookInfoPage';
import { AIPanel } from '@/components/reader/AIPanel';
import { AnalyticsPanel } from '@/components/reader/AnalyticsPanel';
import { TOCPanel } from '@/components/reader/TOCPanel';
import { HighlightsPanel } from '@/components/reader/HighlightsPanel';
import { SplitSearchPanel } from '@/components/reader/SplitSearchPanel';
import { chunkChapterContent } from '@/lib/chunkContent';
import { useReadingSession } from '@/hooks/useReadingSession';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useUser } from '@/context/UserContext';
import { useBooks } from '@/context/BookContext';
import type { Chapter } from '@/data/mockEpubData';
import { cn } from '@/lib/utils';

export default function Reader() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, hasFullAccess } = useUser();
  const { books } = useBooks();

  const bookId = searchParams.get('book') || '';
  const chapterId = searchParams.get('chapter') || '';

  // IMPORTANT: always resolve the book from the dynamic library (BookContext),
  // so uploaded/admin-added books and purchased titles are available here.
  const book = useMemo(
    () => books.find((b) => b.id === bookId),
    [books, bookId],
  );
  
  const isBookInfoPage = chapterId === '__book-info__';
  
  // Default to first chapter if no chapter specified
  const chapter = useMemo(() => {
    if (!book || !book.tableOfContents || book.tableOfContents.length === 0) {
      return undefined;
    }
    
    // Book info page uses a synthetic chapter
    if (isBookInfoPage) {
      return { id: '__book-info__', title: 'Book Information', content: '', pageNumber: 0, tags: [] } as Chapter;
    }
    
    if (chapterId) {
      return book.tableOfContents.find(c => c.id === chapterId);
    }
    
    // No chapter specified - show book info page
    return { id: '__book-info__', title: 'Book Information', content: '', pageNumber: 0, tags: [] } as Chapter;
  }, [book, chapterId, isBookInfoPage]);
  
  // Auto-redirect to first chapter if chapterId was missing
  useEffect(() => {
    if (book && book.tableOfContents && book.tableOfContents.length > 0 && !chapterId && chapter) {
      navigate(`/reader?book=${bookId}&chapter=__book-info__`, { replace: true });
    }
  }, [book, bookId, chapterId, chapter, navigate]);

  const [fontSize, setFontSize] = useState(16);
  const [activePanel, setActivePanel] = useState<string | null>('toc');
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number | null>(null);
  const [viewedChunks, setViewedChunks] = useState<Set<number>>(new Set([0]));

  const { stats, trackEvent, formatTime } = useReadingSession(bookId, chapterId);
  const {
    highlights, annotations, bookmarks,
    activeHighlightColor, highlightColors,
    setActiveHighlightColor,
    addHighlight, removeHighlight,
    addAnnotation, removeAnnotation,
    toggleBookmark, isBookmarked,
  } = useAnnotations(bookId, chapterId);

  // Parse chapter content into chunks
  const chunks = useMemo(() => {
    if (!chapter) return [];
    
    // Debug: log chapter content length
    console.log(`[Reader] Chapter "${chapter.title}" content length:`, chapter.content?.length || 0);
    console.log(`[Reader] Chapter content preview:`, chapter.content?.slice(0, 200) || 'NO CONTENT');
    
    if (!chapter.content || chapter.content.trim().length === 0) {
      console.warn(`[Reader] Chapter "${chapter.title}" has no content!`);
      return [];
    }
    
    return chunkChapterContent(chapter.id, chapter.content);
  }, [chapter]);

  // Redirect if no access or missing book/chapter
  useEffect(() => {
    if (!book) {
      console.warn('[Reader] Book not found:', bookId);
      navigate('/library');
      return;
    }
    
    if (!hasFullAccess(book.id)) {
      console.warn('[Reader] User does not have access to book:', book.id);
      navigate('/library');
      return;
    }
    
    if (!chapter) {
      console.warn('[Reader] Chapter not found. Book has', book.tableOfContents?.length || 0, 'chapters');
      navigate('/library');
      return;
    }
    
    // Log successful load
    console.log(`[Reader] Successfully loaded book "${book.title}", chapter "${chapter.title}"`);
  }, [book, chapter, bookId, hasFullAccess, navigate]);

  const handleChunkClick = useCallback((index: number) => {
    setActiveChunkIndex(index);
    setViewedChunks(prev => new Set(prev).add(index));
    trackEvent('page_view', { chunkIndex: index });
  }, [trackEvent]);

  const handleHighlight = useCallback((text: string, chunkIndex: number) => {
    addHighlight(text, chunkIndex);
    trackEvent('highlight', { text: text.slice(0, 50), chunkIndex });
  }, [addHighlight, trackEvent]);

  const handleAnnotate = useCallback((text: string, note: string, chunkIndex: number) => {
    addAnnotation(text, note, chunkIndex);
    trackEvent('annotation', { text: text.slice(0, 50), chunkIndex });
  }, [addAnnotation, trackEvent]);

  const handleToggleBookmark = useCallback(() => {
    if (!book || !chapter) return;
    toggleBookmark(book.id, chapter.id, chapter.title, book.title);
    trackEvent('bookmark', { chapterId: chapter.id });
  }, [book, chapter, toggleBookmark, trackEvent]);

  const handleNavigateChapter = useCallback((ch: Chapter) => {
    if (!book) return;
    navigate(`/reader?book=${book.id}&chapter=${ch.id}`);
    setActiveChunkIndex(null);
    setViewedChunks(new Set([0]));
  }, [book, navigate]);

  const handleTogglePanel = useCallback((panel: string) => {
    setActivePanel(prev => prev === panel ? null : panel);
  }, []);

  const handleToggleSplitScreen = useCallback(() => {
    setIsSplitScreen(prev => !prev);
  }, []);

  const handleSplitNavigate = useCallback((bookId: string, chapterId: string) => {
    navigate(`/reader?book=${bookId}&chapter=${chapterId}`);
    setActiveChunkIndex(null);
    setViewedChunks(new Set([0]));
  }, [navigate]);

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(Math.max(12, Math.min(24, size)));
  }, []);

  const handleJumpToChunk = useCallback((chunkIndex: number) => {
    setActiveChunkIndex(chunkIndex);
    const el = document.getElementById(`chunk-${chunkIndex}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleAIQuery = useCallback(() => {
    trackEvent('ai_query');
  }, [trackEvent]);

  if (!book || !chapter) return null;

  const currentIndex = isBookInfoPage ? -1 : book.tableOfContents.findIndex(c => c.id === chapter.id);
  const prevChapter = isBookInfoPage ? null : (currentIndex > 0 ? book.tableOfContents[currentIndex - 1] : null);
  const nextChapter = isBookInfoPage ? book.tableOfContents[0] : (currentIndex < book.tableOfContents.length - 1 ? book.tableOfContents[currentIndex + 1] : null);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-card flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex-1" />
        <div className="hidden sm:block text-xs text-muted-foreground">
          Content Reader — EPUB3 Prototype
        </div>
      </div>

      {/* Reader toolbar */}
      <ReaderToolbar
        bookTitle={book.title}
        chapterTitle={chapter.title}
        pageNumber={chapter.pageNumber}
        isBookmarked={isBookmarked(book.id, chapter.id)}
        fontSize={fontSize}
        activePanel={activePanel}
        onToggleBookmark={handleToggleBookmark}
        onShare={() => {
          navigator.clipboard.writeText(window.location.href);
        }}
        onFontSizeChange={handleFontSizeChange}
        onTogglePanel={handleTogglePanel}
        onPrevChapter={prevChapter ? () => handleNavigateChapter(prevChapter) : null}
        onNextChapter={nextChapter ? () => handleNavigateChapter(nextChapter) : null}
        onSearch={() => handleTogglePanel('highlights')}
        isSplitScreen={isSplitScreen}
        onToggleSplitScreen={handleToggleSplitScreen}
      />

      {/* Main reader area */}
      <div className="flex flex-1 overflow-hidden">
        {isSplitScreen ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Book content panel */}
            <ResizablePanel defaultSize={60} minSize={35}>
              <ScrollArea className="h-full">
                <div className="p-8 pl-10">
                  {isBookInfoPage ? (
                    <BookInfoPage book={book} />
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-6 max-w-3xl mx-auto">
                        {chapter.tags.map(tagId => (
                          <span key={tagId} className="medical-tag">{tagId}</span>
                        ))}
                      </div>
                      <ContentRenderer
                        chunks={chunks}
                        fontSize={fontSize}
                        highlights={highlights}
                        annotations={annotations}
                        activeChunkIndex={activeChunkIndex}
                        onChunkClick={handleChunkClick}
                        onHighlight={handleHighlight}
                        onAnnotate={handleAnnotate}
                        highlightColor={activeHighlightColor}
                      />
                    </>
                  )}
                  <div className="flex items-center justify-between mt-12 pt-6 border-t border-border/50 max-w-3xl mx-auto">
                    {prevChapter ? (
                      <Button variant="ghost" onClick={() => handleNavigateChapter(prevChapter)} className="text-left">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        <div>
                          <p className="text-xs text-muted-foreground">Previous</p>
                          <p className="text-sm font-medium truncate max-w-48">{prevChapter.title}</p>
                        </div>
                      </Button>
                    ) : <div />}
                    {nextChapter ? (
                      <Button variant="ghost" onClick={() => handleNavigateChapter(nextChapter)} className="text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Next</p>
                          <p className="text-sm font-medium truncate max-w-48">{nextChapter.title}</p>
                        </div>
                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Button>
                    ) : <div />}
                  </div>
                </div>
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Split search/resources panel */}
            <ResizablePanel defaultSize={40} minSize={25}>
              <SplitSearchPanel
                currentBookId={book.id}
                currentChapterId={chapter.id}
                onNavigateChapter={handleSplitNavigate}
                onClose={handleToggleSplitScreen}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* Normal reader layout */
          <>
            <ScrollArea className="flex-1 h-full">
              <div className="p-8 pl-10">
                {isBookInfoPage ? (
                  <BookInfoPage book={book} />
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-6 max-w-3xl mx-auto">
                      {chapter.tags.map(tagId => (
                        <span key={tagId} className="medical-tag">{tagId}</span>
                      ))}
                    </div>
                    <ContentRenderer
                      chunks={chunks}
                      fontSize={fontSize}
                      highlights={highlights}
                      annotations={annotations}
                      activeChunkIndex={activeChunkIndex}
                      onChunkClick={handleChunkClick}
                      onHighlight={handleHighlight}
                      onAnnotate={handleAnnotate}
                      highlightColor={activeHighlightColor}
                    />
                  </>
                )}
                <div className="flex items-center justify-between mt-12 pt-6 border-t border-border/50 max-w-3xl mx-auto">
                  {prevChapter ? (
                    <Button variant="ghost" onClick={() => handleNavigateChapter(prevChapter)} className="text-left">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      <div>
                        <p className="text-xs text-muted-foreground">Previous</p>
                        <p className="text-sm font-medium truncate max-w-48">{prevChapter.title}</p>
                      </div>
                    </Button>
                  ) : <div />}
                  {nextChapter ? (
                    <Button variant="ghost" onClick={() => handleNavigateChapter(nextChapter)} className="text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Next</p>
                        <p className="text-sm font-medium truncate max-w-48">{nextChapter.title}</p>
                      </div>
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  ) : <div />}
                </div>
              </div>
            </ScrollArea>
          </>
        )}

        {/* Side panel (TOC, AI, Analytics, Highlights) — only in non-split mode */}
        {activePanel && !isSplitScreen && (
          <div className="w-80 border-l border-border/50 bg-card/50 flex flex-col flex-shrink-0">
            <div className="flex items-center justify-end p-1 border-b border-border/50">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivePanel(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              {activePanel === 'toc' && (
                <TOCPanel
                  book={book}
                  currentChapterId={chapter.id}
                  onSelectChapter={handleNavigateChapter}
                />
              )}
              {activePanel === 'ai' && (
                <AIPanel
                  chapterTitle={chapter.title}
                  chapterContent={chapter.content}
                  bookTitle={book.title}
                  bookId={book.id}
                  chapterId={chapter.id}
                  onAIQuery={handleAIQuery}
                />
              )}
              {activePanel === 'analytics' && (
                <AnalyticsPanel
                  stats={stats}
                  formattedTime={formatTime(stats.totalTimeSeconds)}
                  totalChunks={chunks.length}
                  viewedChunks={viewedChunks.size}
                  bookTitle={book.title}
                  chapterTitle={chapter.title}
                />
              )}
              {activePanel === 'highlights' && (
                <HighlightsPanel
                  highlights={highlights}
                  annotations={annotations}
                  bookmarks={bookmarks}
                  highlightColors={highlightColors}
                  activeColor={activeHighlightColor}
                  onColorChange={setActiveHighlightColor}
                  onRemoveHighlight={removeHighlight}
                  onRemoveAnnotation={removeAnnotation}
                  onJumpToChunk={handleJumpToChunk}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
