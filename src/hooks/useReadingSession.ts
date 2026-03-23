import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReadingEvent {
  id: string;
  type: 'page_view' | 'highlight' | 'bookmark' | 'annotation' | 'search' | 'ai_query' | 'time_spent';
  bookId: string;
  chapterId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ReadingStats {
  totalTimeSeconds: number;
  chaptersViewed: number;
  highlightsCreated: number;
  annotationsCreated: number;
  bookmarksCreated: number;
  aiQueriesUsed: number;
  searchesPerformed: number;
}

export function useReadingSession(bookId: string, chapterId: string) {
  const [events, setEvents] = useState<ReadingEvent[]>([]);
  const [stats, setStats] = useState<ReadingStats>({
    totalTimeSeconds: 0,
    chaptersViewed: 1,
    highlightsCreated: 0,
    annotationsCreated: 0,
    bookmarksCreated: 0,
    aiQueriesUsed: 0,
    searchesPerformed: 0,
  });
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const bookTitleRef = useRef<string>('');

  // Resolve book title once
  useEffect(() => {
    supabase.from('books').select('title').eq('id', bookId).maybeSingle().then(({ data }) => {
      bookTitleRef.current = data?.title || bookId;
    });
  }, [bookId]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalTimeSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));
    }, 1000);

    // Log page_view + chapter_view events to DB
    persistEvent('page_view', bookId, { chapter_id: chapterId });
    persistEvent('chapter_view', bookId, { chapter_id: chapterId });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Log time_spent on unmount
      const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (seconds > 5) {
        persistEvent('time_spent', bookId, { chapter_id: chapterId, seconds });
      }
    };
  }, [bookId, chapterId]);

  const persistEvent = async (eventType: string, bId: string, metadata?: Record<string, unknown>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      
      // Get enterprise_id from profile if logged in
      let enterpriseId: string | null = null;
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('enterprise_id')
          .eq('id', userId)
          .maybeSingle();
        enterpriseId = profile?.enterprise_id || null;
      }

      await supabase.from('usage_events').insert([{
        event_type: eventType,
        book_id: bId,
        book_title: bookTitleRef.current || null,
        user_id: userId,
        enterprise_id: enterpriseId,
        metadata: (metadata as any) || {},
      }]);
    } catch (err) {
      console.warn('Failed to persist reading event:', err);
    }
  };

  const trackEvent = useCallback((type: ReadingEvent['type'], metadata?: Record<string, unknown>) => {
    const event: ReadingEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      bookId,
      chapterId,
      timestamp: new Date(),
      metadata,
    };
    setEvents(prev => [...prev, event]);

    setStats(prev => {
      const updates = { ...prev };
      switch (type) {
        case 'highlight': updates.highlightsCreated++; break;
        case 'annotation': updates.annotationsCreated++; break;
        case 'bookmark': updates.bookmarksCreated++; break;
        case 'ai_query': updates.aiQueriesUsed++; break;
        case 'search': updates.searchesPerformed++; break;
      }
      return updates;
    });

    // Persist to DB
    persistEvent(type, bookId, { chapter_id: chapterId, ...metadata });

    return event;
  }, [bookId, chapterId]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return { events, stats, trackEvent, formatTime };
}
