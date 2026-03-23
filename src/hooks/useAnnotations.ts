import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Highlight {
  id: string;
  text: string;
  color: string;
  chunkIndex: number;
  createdAt: Date;
}

export interface Annotation {
  id: string;
  text: string;
  note: string;
  chunkIndex: number;
  createdAt: Date;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  bookTitle: string;
  createdAt: Date;
}

const HIGHLIGHT_COLORS = [
  'hsl(48 96% 70%)',
  'hsl(142 72% 70%)',
  'hsl(199 89% 70%)',
  'hsl(330 80% 75%)',
  'hsl(280 60% 75%)',
];

export function useAnnotations(bookId?: string, chapterId?: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeHighlightColor, setActiveHighlightColor] = useState(HIGHLIGHT_COLORS[0]);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load from DB when bookId/chapterId/userId changes
  useEffect(() => {
    if (!userId || !bookId) return;

    const loadData = async () => {
      // Load highlights
      const hQuery = supabase.from('highlights').select('*').eq('user_id', userId).eq('book_id', bookId);
      if (chapterId) hQuery.eq('chapter_id', chapterId);
      const { data: hData } = await hQuery;
      setHighlights((hData || []).map(h => ({
        id: h.id,
        text: h.text,
        color: h.color,
        chunkIndex: h.chunk_index,
        createdAt: new Date(h.created_at),
      })));

      // Load annotations
      const aQuery = supabase.from('annotations').select('*').eq('user_id', userId).eq('book_id', bookId);
      if (chapterId) aQuery.eq('chapter_id', chapterId);
      const { data: aData } = await aQuery;
      setAnnotations((aData || []).map(a => ({
        id: a.id,
        text: a.text,
        note: a.note,
        chunkIndex: a.chunk_index,
        createdAt: new Date(a.created_at),
      })));

      // Load bookmarks (all for this user)
      const { data: bData } = await supabase.from('bookmarks').select('*').eq('user_id', userId);
      setBookmarks((bData || []).map(b => ({
        id: b.id,
        bookId: b.book_id,
        chapterId: b.chapter_id,
        chapterTitle: b.chapter_title,
        bookTitle: b.book_title,
        createdAt: new Date(b.created_at),
      })));
    };

    loadData();
  }, [userId, bookId, chapterId]);

  const addHighlight = useCallback(async (text: string, chunkIndex: number) => {
    const highlight: Highlight = {
      id: `hl-${Date.now()}`,
      text,
      color: activeHighlightColor,
      chunkIndex,
      createdAt: new Date(),
    };
    setHighlights(prev => [...prev, highlight]);

    if (userId && bookId && chapterId) {
      const { data } = await supabase.from('highlights').insert({
        user_id: userId,
        book_id: bookId,
        chapter_id: chapterId,
        text,
        color: activeHighlightColor,
        chunk_index: chunkIndex,
      }).select('id').maybeSingle();
      if (data) {
        setHighlights(prev => prev.map(h => h.id === highlight.id ? { ...h, id: data.id } : h));
      }
    }
    return highlight;
  }, [activeHighlightColor, userId, bookId, chapterId]);

  const removeHighlight = useCallback(async (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    await supabase.from('highlights').delete().eq('id', id);
  }, []);

  const addAnnotation = useCallback(async (text: string, note: string, chunkIndex: number) => {
    const annotation: Annotation = {
      id: `an-${Date.now()}`,
      text,
      note,
      chunkIndex,
      createdAt: new Date(),
    };
    setAnnotations(prev => [...prev, annotation]);

    if (userId && bookId && chapterId) {
      const { data } = await supabase.from('annotations').insert({
        user_id: userId,
        book_id: bookId,
        chapter_id: chapterId,
        text,
        note,
        chunk_index: chunkIndex,
      }).select('id').maybeSingle();
      if (data) {
        setAnnotations(prev => prev.map(a => a.id === annotation.id ? { ...a, id: data.id } : a));
      }
    }
    return annotation;
  }, [userId, bookId, chapterId]);

  const removeAnnotation = useCallback(async (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    await supabase.from('annotations').delete().eq('id', id);
  }, []);

  const toggleBookmark = useCallback(async (bId: string, cId: string, chapterTitle: string, bookTitle: string) => {
    const existing = bookmarks.find(b => b.bookId === bId && b.chapterId === cId);
    if (existing) {
      setBookmarks(prev => prev.filter(b => b.id !== existing.id));
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      return null;
    }
    const bookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      bookId: bId,
      chapterId: cId,
      chapterTitle,
      bookTitle,
      createdAt: new Date(),
    };
    setBookmarks(prev => [...prev, bookmark]);

    if (userId) {
      const { data } = await supabase.from('bookmarks').insert({
        user_id: userId,
        book_id: bId,
        chapter_id: cId,
        chapter_title: chapterTitle,
        book_title: bookTitle,
      }).select('id').maybeSingle();
      if (data) {
        setBookmarks(prev => prev.map(b => b.id === bookmark.id ? { ...b, id: data.id } : b));
      }
    }
    return bookmark;
  }, [bookmarks, userId]);

  const isBookmarked = useCallback((bId: string, cId: string) => {
    return bookmarks.some(b => b.bookId === bId && b.chapterId === cId);
  }, [bookmarks]);

  return {
    highlights,
    annotations,
    bookmarks,
    activeHighlightColor,
    highlightColors: HIGHLIGHT_COLORS,
    setActiveHighlightColor,
    addHighlight,
    removeHighlight,
    addAnnotation,
    removeAnnotation,
    toggleBookmark,
    isBookmarked,
  };
}
