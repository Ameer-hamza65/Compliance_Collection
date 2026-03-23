import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useBooks } from '@/context/BookContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, FileText, Tag, Calendar, Building2, Hash, Layers, Loader2 } from 'lucide-react';

interface BookData {
  id: string;
  title: string;
  subtitle: string | null;
  authors: string[];
  publisher: string | null;
  isbn: string | null;
  edition: string | null;
  published_year: number | null;
  description: string | null;
  specialty: string | null;
  tags: string[] | null;
  cover_color: string | null;
  chapter_count: number | null;
  file_type: string | null;
}

interface ChapterData {
  id: string;
  title: string;
  page_number: number | null;
  sort_order: number | null;
}

interface CollectionMembership {
  collection_id: string;
  collection_name: string;
  category: string;
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBook } = useBooks();
  const [book, setBook] = useState<BookData | null>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [collections, setCollections] = useState<CollectionMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadBook(id);
  }, [id]);

  const loadBook = async (bookId: string) => {
    setLoading(true);
    const [bookRes, chaptersRes, collBooksRes] = await Promise.all([
      supabase.from('books').select('*').eq('id', bookId).maybeSingle(),
      supabase.from('book_chapters').select('id, title, page_number, sort_order').eq('book_id', bookId).order('sort_order', { ascending: true }),
      supabase.from('collection_books').select('collection_id').eq('book_id', bookId),
    ]);

    if (bookRes.data) {
      setBook(bookRes.data as BookData);
      setChapters((chaptersRes.data || []) as ChapterData[]);
    } else {
      // Fallback to BookContext (mock/compliance data)
      const contextBook = getBook(bookId);
      if (contextBook) {
        setBook({
          id: contextBook.id,
          title: contextBook.title,
          subtitle: contextBook.subtitle || null,
          authors: contextBook.authors,
          publisher: contextBook.publisher || null,
          isbn: contextBook.isbn || null,
          edition: contextBook.edition || null,
          published_year: contextBook.publishedYear || null,
          description: contextBook.description || null,
          specialty: contextBook.specialty || null,
          tags: contextBook.tags || null,
          cover_color: contextBook.coverColor || null,
          chapter_count: contextBook.tableOfContents.length,
          file_type: null,
        });
        setChapters(contextBook.tableOfContents.map((ch, i) => ({
          id: ch.id,
          title: ch.title,
          page_number: ch.pageNumber || null,
          sort_order: i,
        })));
      } else {
        setBook(null);
      }
    }

    // Resolve collection names
    const collIds = (collBooksRes.data || []).map(cb => cb.collection_id);
    if (collIds.length > 0) {
      const { data: colls } = await supabase
        .from('compliance_collections')
        .select('id, name, category')
        .in('id', collIds);
      setCollections((colls || []).map(c => ({
        collection_id: c.id,
        collection_name: c.name,
        category: c.category,
      })));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Book Not Found</CardTitle>
            <CardDescription>The requested title could not be found in the repository.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/library')}>Browse Library</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="medical-gradient">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6">
            <div
              className="w-32 h-44 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: book.cover_color || 'hsl(213 50% 25%)' }}
            >
              <BookOpen className="h-10 w-10 opacity-50" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{book.title}</h1>
              {book.subtitle && <p className="text-muted-foreground mt-1">{book.subtitle}</p>}
              <p className="text-sm text-muted-foreground mt-2">{book.authors.join(', ')}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {book.specialty && <Badge variant="secondary">{book.specialty}</Badge>}
                {book.file_type && <Badge variant="outline" className="uppercase text-xs">{book.file_type}</Badge>}
                {book.edition && <Badge variant="outline">Edition: {book.edition}</Badge>}
              </div>
              <div className="mt-4">
                <Button onClick={() => navigate(`/reader?bookId=${book.id}`)} className="gap-2">
                  <BookOpen className="h-4 w-4" /> Read Book
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {book.description && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Chapters ({chapters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chapters.length > 0 ? (
                  <div className="space-y-2">
                    {chapters.map((ch, i) => (
                      <div key={ch.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                          <span className="text-sm font-medium">{ch.title}</span>
                        </div>
                        {ch.page_number && <span className="text-xs text-muted-foreground">p. {ch.page_number}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No chapters indexed yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {book.publisher && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{book.publisher}</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{book.isbn}</span>
                  </div>
                )}
                {book.published_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{book.published_year}</span>
                  </div>
                )}
                {book.chapter_count != null && (
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{book.chapter_count} chapters</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {collections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5" /> Collections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {collections.map(c => (
                      <div key={c.collection_id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{c.collection_name}</span>
                        <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {book.tags && book.tags.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Tags</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
