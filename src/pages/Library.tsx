import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AISearchResults } from '@/components/AISearchResults';
import { EpubBook } from '@/data/mockEpubData';
import { useBooks } from '@/context/BookContext';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Library() {
  const navigate = useNavigate();
  const { books } = useBooks();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [aiResults, setAiResults] = useState<Array<{ bookId: string; title: string; reason: string; specialty: string; collection?: string; relevanceScore?: number; chapters?: Array<{ id: string; title: string; reason: string }> }>>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setHasSearched(true);
    setAiLoading(true);
    setAiResults([]);

    try {
      const bookCatalog = books.map(b => ({
        id: b.id,
        title: b.title,
        specialty: b.specialty,
        description: b.description.slice(0, 200),
        tags: b.tags?.slice(0, 8) || [],
        year: b.publishedYear,
        chapters: b.tableOfContents.slice(0, 15).map(ch => ({ id: ch.id, title: ch.title })),
      }));

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt: query,
          chapterContent: JSON.stringify(bookCatalog),
          chapterTitle: 'Book Catalog',
          bookTitle: 'Compliance Collections Library',
          type: 'search',
          userId: user.id || null,
          enterpriseId: user.enterpriseId || null,
        },
      });

      if (error) {
        const errMsg = typeof data === 'object' && data?.error ? data.error : error.message;
        if (errMsg?.includes('Rate limit') || errMsg?.includes('429')) {
          toast({ title: 'AI Busy', description: 'Please try again in a moment.', variant: 'destructive' });
        }
        setAiResults([]);
      } else if (data?.results && Array.isArray(data.results)) {
        setAiResults(data.results.slice(0, 8).map((r: any) => ({
          bookId: r.bookId || '',
          title: r.title || '',
          reason: r.reason || '',
          specialty: r.specialty || '',
          collection: r.collection || null,
          relevanceScore: r.relevanceScore || 0,
          chapters: r.chapters || [],
        })));
      } else if (data?.content) {
        try {
          const jsonMatch = data.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setAiResults(parsed.slice(0, 8));
          }
        } catch {
          setAiResults([]);
        }
      }
    } catch {
      setAiResults([]);
    } finally {
      setAiLoading(false);
    }
  }, [searchTerm, books, user.id, user.enterpriseId, toast]);

  const handleView = useCallback((book: EpubBook) => {
    if (book.tableOfContents && book.tableOfContents.length > 0) {
      navigate(`/reader?book=${book.id}&chapter=${book.tableOfContents[0].id}`);
    }
  }, [navigate]);

  const handleViewBook = useCallback((bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book && book.tableOfContents.length > 0) {
      navigate(`/reader?book=${book.id}&chapter=${book.tableOfContents[0].id}`);
    }
  }, [books, navigate]);

  const handleViewChapter = useCallback((bookId: string, chapterId: string) => {
    navigate(`/reader?book=${bookId}&chapter=${chapterId}`);
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setHasSearched(false);
    setAiResults([]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-foreground">Compliance Content Catalog</h1>
            <p className="text-muted-foreground mt-1">
              {books.length} titles across 5 curated compliance collections
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container py-8">
        {/* AI Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          className="flex gap-3 mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ask AI: e.g. 'infection control protocols' or 'OSHA workplace safety'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={!searchTerm.trim() || aiLoading}>
            <Sparkles className="h-4 w-4 mr-1.5" />
            AI Search
          </Button>
          {hasSearched && (
            <Button type="button" variant="outline" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </motion.form>

        {/* AI Results */}
        {hasSearched && (
          <div className="mb-8">
            <AISearchResults
              recommendations={aiResults}
              loading={aiLoading}
              query={searchTerm}
              onViewBook={handleViewBook}
              onViewChapter={handleViewChapter}
            />
            {!aiLoading && aiResults.length === 0 && (
              <div className="text-center py-12 glass-card rounded-xl">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No AI results found</h3>
                <p className="text-muted-foreground text-sm mb-4">Try rephrasing your query</p>
                <Button variant="outline" onClick={clearSearch}>Browse All Titles</Button>
              </div>
            )}
          </div>
        )}

        {/* Browse all books when not searching */}
        {!hasSearched && (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing all {books.length} titles — use AI search above for intelligent results
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
                >
                  <BookCard book={book} onView={handleView} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
