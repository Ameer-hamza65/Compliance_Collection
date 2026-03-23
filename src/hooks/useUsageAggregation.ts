import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DateRange = '7d' | '30d' | '90d' | 'all';

interface UsageEvent {
  id: string;
  event_type: string;
  book_id: string | null;
  book_title: string | null;
  user_id: string | null;
  enterprise_id: string | null;
  metadata: any;
  created_at: string;
}

interface AILog {
  id: string;
  query_type: string;
  book_id: string;
  book_title: string;
  chapter_title: string;
  response_time_ms: number;
  tokens_used: number | null;
  created_at: string;
  user_id: string | null;
}

interface ProfileInfo {
  id: string;
  email: string;
  full_name: string | null;
}

export interface AggregatedStats {
  totalViews: number;
  totalSearches: number;
  totalAccessDenied: number;
  totalAIQueries: number;
  avgAIResponseTime: number;
  dailyActivity: { date: string; views: number; searches: number; aiQueries: number }[];
  topBooks: { bookId: string; title: string; views: number }[];
  topSearches: { query: string; count: number }[];
  aiByType: { type: string; count: number }[];
  collectionUsage: { collectionId: string; collectionName: string; views: number }[];
}

export interface UserActivity {
  userId: string;
  email: string;
  fullName: string;
  department: string;
  views: number;
  aiQueries: number;
  lastAccess: string;
}

function getSinceDate(range: DateRange): string | null {
  if (range === 'all') return null;
  const d = new Date();
  if (range === '7d') d.setDate(d.getDate() - 7);
  else if (range === '30d') d.setDate(d.getDate() - 30);
  else if (range === '90d') d.setDate(d.getDate() - 90);
  return d.toISOString();
}

export function useUsageAggregation(dateRange: DateRange = '30d', enterpriseId?: string | null) {
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const [aiLogs, setAILogs] = useState<AILog[]>([]);
  const [profilesMap, setProfilesMap] = useState<Map<string, ProfileInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const collectionUsageRef = useRef<{ collectionId: string; collectionName: string; views: number }[]>([]);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      const since = getSinceDate(dateRange);

      try {
        // Fetch usage events
        let usageQuery = supabase
          .from('usage_events')
          .select('id, event_type, book_id, book_title, user_id, enterprise_id, metadata, created_at')
          .order('created_at', { ascending: false })
          .limit(1000);
        if (since) usageQuery = usageQuery.gte('created_at', since);
        if (enterpriseId) usageQuery = usageQuery.eq('enterprise_id', enterpriseId);
        const { data: uData, error: uErr } = await usageQuery;
        if (uErr) console.warn('Usage events error:', uErr.message);

        // Fetch AI logs
        let aiQuery = supabase
          .from('ai_query_logs')
          .select('id, query_type, book_id, book_title, chapter_title, response_time_ms, tokens_used, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(1000);
        if (since) aiQuery = aiQuery.gte('created_at', since);
        if (enterpriseId) aiQuery = aiQuery.eq('enterprise_id', enterpriseId);
        const { data: aData, error: aErr } = await aiQuery;
        if (aErr) console.warn('AI logs error:', aErr.message);

        // Collect unique user_ids and fetch profiles
        const userIds = new Set<string>();
        (uData || []).forEach((e: any) => { if (e.user_id) userIds.add(e.user_id); });
        (aData || []).forEach((l: any) => { if (l.user_id) userIds.add(l.user_id); });

        const pMap = new Map<string, ProfileInfo>();
        if (userIds.size > 0) {
          const idArray = Array.from(userIds);
          // Fetch in batches of 50 to stay within query limits
          for (let i = 0; i < idArray.length; i += 50) {
            const batch = idArray.slice(i, i + 50);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, email, full_name')
              .in('id', batch);
            (profiles || []).forEach(p => pMap.set(p.id, p as ProfileInfo));
          }
        }
        setProfilesMap(pMap);

        // Fetch collection_books and collections for cross-referencing
        const { data: collBooks } = await supabase
          .from('collection_books')
          .select('book_id, collection_id');
        const collBookIds = [...new Set((collBooks || []).map(cb => cb.collection_id))];
        let collectionsMap = new Map<string, string>();
        if (collBookIds.length > 0) {
          const { data: colls } = await supabase
            .from('compliance_collections')
            .select('id, name')
            .in('id', collBookIds);
          (colls || []).forEach(c => collectionsMap.set(c.id, c.name));
        }
        // Build book_id -> collection mappings
        const bookToCollections = new Map<string, Set<string>>();
        (collBooks || []).forEach(cb => {
          const collName = collectionsMap.get(cb.collection_id);
          if (collName) {
            if (!bookToCollections.has(cb.book_id)) bookToCollections.set(cb.book_id, new Set());
            bookToCollections.get(cb.book_id)!.add(`${cb.collection_id}::${collName}`);
          }
        });

        setUsageEvents((uData || []) as UsageEvent[]);
        setAILogs((aData || []) as AILog[]);

        // Compute collection usage from view events
        const collUsageMap = new Map<string, { collectionName: string; views: number }>();
        const viewEvents = (uData || []).filter((e: any) => e.event_type === 'chapter_view' || e.event_type === 'item_request');
        viewEvents.forEach((e: any) => {
          const bookId = e.book_id;
          if (!bookId) return;
          const colls = bookToCollections.get(bookId);
          if (!colls) return;
          colls.forEach(key => {
            const [collId, collName] = key.split('::');
            const existing = collUsageMap.get(collId) || { collectionName: collName, views: 0 };
            existing.views++;
            collUsageMap.set(collId, existing);
          });
        });
        const computedCollUsage = Array.from(collUsageMap.entries())
          .map(([collectionId, data]) => ({ collectionId, collectionName: data.collectionName, views: data.views }))
          .sort((a, b) => b.views - a.views);
        collectionUsageRef.current = computedCollUsage;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [dateRange, enterpriseId]);

  const stats: AggregatedStats = useMemo(() => {
    const views = usageEvents.filter(e => e.event_type === 'chapter_view' || e.event_type === 'item_request');
    const searches = usageEvents.filter(e => e.event_type === 'search');
    const denied = usageEvents.filter(e => e.event_type === 'access_denied');

    // Daily activity
    const dailyMap = new Map<string, { views: number; searches: number; aiQueries: number }>();
    usageEvents.forEach(e => {
      const date = e.created_at.split('T')[0];
      const entry = dailyMap.get(date) || { views: 0, searches: 0, aiQueries: 0 };
      if (e.event_type === 'chapter_view' || e.event_type === 'item_request') entry.views++;
      if (e.event_type === 'search') entry.searches++;
      dailyMap.set(date, entry);
    });
    aiLogs.forEach(l => {
      const date = l.created_at.split('T')[0];
      const entry = dailyMap.get(date) || { views: 0, searches: 0, aiQueries: 0 };
      entry.aiQueries++;
      dailyMap.set(date, entry);
    });
    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top books
    const bookMap = new Map<string, { title: string; views: number }>();
    views.forEach(e => {
      const key = e.book_id || 'unknown';
      const existing = bookMap.get(key) || { title: e.book_title || 'Unknown', views: 0 };
      existing.views++;
      bookMap.set(key, existing);
    });
    const topBooks = Array.from(bookMap.entries())
      .map(([bookId, data]) => ({ bookId, ...data }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top searches from metadata
    const searchMap = new Map<string, number>();
    searches.forEach(e => {
      const query = (e.metadata as any)?.query || e.book_title || 'unknown';
      searchMap.set(query, (searchMap.get(query) || 0) + 1);
    });
    const topSearches = Array.from(searchMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // AI by type
    const typeMap = new Map<string, number>();
    aiLogs.forEach(l => {
      typeMap.set(l.query_type, (typeMap.get(l.query_type) || 0) + 1);
    });
    const aiByType = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const avgRT = aiLogs.length > 0
      ? aiLogs.reduce((s, l) => s + l.response_time_ms, 0) / aiLogs.length
      : 0;

    return {
      totalViews: views.length,
      totalSearches: searches.length,
      totalAccessDenied: denied.length,
      totalAIQueries: aiLogs.length,
      avgAIResponseTime: avgRT,
      dailyActivity,
      topBooks,
      topSearches,
      aiByType,
      collectionUsage: collectionUsageRef.current,
    };
  }, [usageEvents, aiLogs]);

  // User activity data — now with real names from profiles
  const userActivity: UserActivity[] = useMemo(() => {
    const userMap = new Map<string, { views: number; aiQueries: number; lastAccess: string }>();
    
    usageEvents.forEach(e => {
      if (!e.user_id) return;
      const existing = userMap.get(e.user_id) || { views: 0, aiQueries: 0, lastAccess: e.created_at };
      if (e.event_type === 'chapter_view' || e.event_type === 'item_request') existing.views++;
      if (e.created_at > existing.lastAccess) existing.lastAccess = e.created_at;
      userMap.set(e.user_id, existing);
    });

    aiLogs.forEach(l => {
      if (!l.user_id) return;
      const existing = userMap.get(l.user_id) || { views: 0, aiQueries: 0, lastAccess: l.created_at };
      existing.aiQueries++;
      if (l.created_at > existing.lastAccess) existing.lastAccess = l.created_at;
      userMap.set(l.user_id, existing);
    });

    return Array.from(userMap.entries()).map(([userId, data]) => {
      const profile = profilesMap.get(userId);
      return {
        userId,
        email: profile?.email || '',
        fullName: profile?.full_name || profile?.email?.split('@')[0] || userId.slice(0, 8),
        department: 'N/A',
        ...data,
      };
    }).sort((a, b) => b.views - a.views);
  }, [usageEvents, aiLogs, profilesMap]);

  return { stats, userActivity, usageEvents, aiLogs, loading, error };
}
