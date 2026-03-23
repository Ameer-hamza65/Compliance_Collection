import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { EpubBook, epubBooks as initialBooks } from '@/data/mockEpubData';
import { additionalComplianceTitles, complianceCollections } from '@/data/complianceData';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';

// Get all book IDs referenced by compliance collections
const complianceBookIds = new Set(
  complianceCollections.flatMap(c => c.bookIds)
);

// Only include original books that are part of compliance collections
const filteredOriginalBooks = initialBooks.filter(b => complianceBookIds.has(b.id));

// Merge filtered original books with additional compliance titles (no duplicates)
const additionalBooks: EpubBook[] = additionalComplianceTitles
  .filter(ct => !filteredOriginalBooks.some(b => b.id === ct.id))
  .map(ct => ({
    id: ct.id,
    title: ct.title,
    subtitle: ct.subtitle,
    authors: ct.authors,
    publisher: ct.publisher,
    isbn: ct.isbn,
    publishedYear: ct.publishedYear,
    edition: ct.edition,
    coverColor: ct.coverColor,
    price: 0,
    description: ct.description,
    specialty: ct.specialty,
    tags: ct.tags,
    accessCount: Math.floor(Math.random() * 5000) + 500,
    searchCount: Math.floor(Math.random() * 3000) + 200,
    tableOfContents: ct.chapters.map(ch => ({
      id: ch.id,
      title: ch.title,
      content: ch.content,
      pageNumber: ch.pageNumber,
      tags: ch.tags,
    })),
  }));

const mockBooks: EpubBook[] = [...filteredOriginalBooks, ...additionalBooks];

interface BookContextType {
  books: EpubBook[];
  addBook: (book: EpubBook) => void;
  removeBook: (bookId: string) => void;
  updateBook: (bookId: string, updates: Partial<EpubBook>) => void;
  getBook: (bookId: string) => EpubBook | undefined;
  totalBooks: number;
  isLoading: boolean;
  refreshFromDB: () => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<EpubBook[]>(mockBooks);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useUser();

  // Fetch books from database and merge with mock data
  const refreshFromDB = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: dbBooks, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch books from DB, using mock data:', error.message);
        setBooks(mockBooks);
        return;
      }

      if (dbBooks && dbBooks.length > 0) {
        // Fetch chapters for all DB books
        const bookIds = dbBooks.map(b => b.id);
        const { data: dbChapters } = await supabase
          .from('book_chapters')
          .select('*')
          .in('book_id', bookIds)
          .order('sort_order', { ascending: true });

        const chaptersByBook = new Map<string, any[]>();
        (dbChapters || []).forEach(ch => {
          const existing = chaptersByBook.get(ch.book_id) || [];
          existing.push(ch);
          chaptersByBook.set(ch.book_id, existing);
        });

        // Convert DB books to EpubBook format
        const convertedBooks: EpubBook[] = dbBooks.map(db => ({
          id: db.id,
          title: db.title,
          subtitle: db.subtitle || undefined,
          authors: db.authors || [],
          publisher: db.publisher || '',
          isbn: db.isbn || '',
          publishedYear: db.published_year || new Date().getFullYear(),
          edition: db.edition || undefined,
          coverColor: db.cover_color || 'hsl(213 50% 25%)',
          price: 0,
          description: db.description || '',
          specialty: db.specialty || 'Internal Medicine',
          accessCount: db.access_count || 0,
          searchCount: db.search_count || 0,
          tags: db.tags || [],
          tableOfContents: (chaptersByBook.get(db.id) || []).map(ch => ({
            id: ch.chapter_key,
            title: ch.title,
            content: ch.content || '',
            pageNumber: ch.page_number || 1,
            tags: ch.tags || [],
          })),
        }));

        // Merge: DB books first, then mock books that don't overlap
        const dbBookIds = new Set(convertedBooks.map(b => b.id));
        const uniqueMockBooks = mockBooks.filter(b => !dbBookIds.has(b.id));
        setBooks([...convertedBooks, ...uniqueMockBooks]);
      } else {
        setBooks(mockBooks);
      }
    } catch (err) {
      console.warn('DB fetch error, using mock data:', err);
      setBooks(mockBooks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch from DB whenever auth state settles or changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve
    refreshFromDB();
  }, [refreshFromDB, authLoading, user.isLoggedIn]);

  const addBook = useCallback((book: EpubBook) => {
    setBooks(prev => {
      // Avoid duplicates
      if (prev.some(b => b.id === book.id)) return prev;
      return [book, ...prev];
    });
  }, []);

  const removeBook = useCallback((bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
  }, []);

  const updateBook = useCallback((bookId: string, updates: Partial<EpubBook>) => {
    setBooks(prev => prev.map(b => 
      b.id === bookId ? { ...b, ...updates } : b
    ));
  }, []);

  const getBook = useCallback((bookId: string) => {
    return books.find(b => b.id === bookId);
  }, [books]);

  return (
    <BookContext.Provider value={{ 
      books, 
      addBook, 
      removeBook, 
      updateBook, 
      getBook,
      totalBooks: books.length,
      isLoading,
      refreshFromDB,
    }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}
