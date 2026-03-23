import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FolderOpen, Lock } from 'lucide-react';
import { exportToCSV } from '@/lib/csvExport';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CollectionUsageReportProps {
  usageEvents: Array<{ book_id: string | null; book_title: string | null; event_type: string }>;
  canExportCSV: boolean;
}

interface CollectionRow {
  id: string;
  name: string;
  category: string;
  bookIds: string[];
}

export function CollectionUsageReport({ usageEvents, canExportCSV }: CollectionUsageReportProps) {
  const { toast } = useToast();
  const [dbCollections, setDbCollections] = useState<CollectionRow[]>([]);

  useEffect(() => {
    async function load() {
      const { data: colls } = await supabase.from('compliance_collections').select('id, name, category');
      if (!colls || colls.length === 0) return;
      const collIds = colls.map(c => c.id);
      const { data: cbRows } = await supabase.from('collection_books').select('collection_id, book_id').in('collection_id', collIds);
      const bookMap = new Map<string, string[]>();
      (cbRows || []).forEach(cb => {
        const arr = bookMap.get(cb.collection_id) || [];
        arr.push(cb.book_id);
        bookMap.set(cb.collection_id, arr);
      });
      setDbCollections(colls.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        bookIds: bookMap.get(c.id) || [],
      })));
    }
    load();
  }, []);

  const collectionStats = useMemo(() => {
    return dbCollections.map(collection => {
      const bookIdsSet = new Set(collection.bookIds);
      const collectionEvents = usageEvents.filter(e =>
        e.book_id && bookIdsSet.has(e.book_id)
      );
      const views = collectionEvents.filter(e => e.event_type === 'chapter_view' || e.event_type === 'item_request' || e.event_type === 'page_view').length;
      const uniqueTitles = new Set(collectionEvents.map(e => e.book_id)).size;
      return {
        id: collection.id,
        name: collection.name,
        category: collection.category,
        totalTitles: collection.bookIds.length,
        titlesAccessed: uniqueTitles,
        totalViews: views,
      };
    }).sort((a, b) => b.totalViews - a.totalViews);
  }, [usageEvents, dbCollections]);

  const handleExport = () => {
    exportToCSV(
      collectionStats,
      [
        { header: 'Collection', accessor: (r) => r.name },
        { header: 'Category', accessor: (r) => r.category },
        { header: 'Total Titles', accessor: (r) => r.totalTitles },
        { header: 'Titles Accessed', accessor: (r) => r.titlesAccessed },
        { header: 'Total Views', accessor: (r) => r.totalViews },
      ],
      `collection_usage_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    toast({ title: 'Report Exported', description: 'Collection usage report downloaded as CSV.' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-accent" />
              Collection Usage Report
            </CardTitle>
            <CardDescription>Usage breakdown by compliance collection</CardDescription>
          </div>
          {canExportCSV ? (
            <Button size="sm" variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          ) : (
            <Badge variant="outline" className="gap-1 text-warning">
              <Lock className="h-3 w-3" /> Pro plan required
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Titles</TableHead>
              <TableHead className="text-right">Accessed</TableHead>
              <TableHead className="text-right">Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collectionStats.length > 0 ? collectionStats.map(row => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs capitalize">{row.category}</Badge></TableCell>
                <TableCell className="text-right">{row.totalTitles}</TableCell>
                <TableCell className="text-right">{row.titlesAccessed}</TableCell>
                <TableCell className="text-right font-semibold">{row.totalViews.toLocaleString()}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No collection data yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
