import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Search } from 'lucide-react';
import { exportToCSV } from '@/lib/csvExport';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

interface SearchAnalyticsReportProps {
  usageEvents: Array<{
    event_type: string;
    metadata: any;
    created_at: string;
    book_title: string | null;
  }>;
  canExportCSV: boolean;
}

export function SearchAnalyticsReport({ usageEvents, canExportCSV }: SearchAnalyticsReportProps) {
  const { toast } = useToast();

  const searchEvents = useMemo(() =>
    usageEvents.filter(e => e.event_type === 'search'),
    [usageEvents]
  );

  const topQueries = useMemo(() => {
    const map = new Map<string, number>();
    searchEvents.forEach(e => {
      const q = e.metadata?.query || e.book_title || 'unknown';
      map.set(q, (map.get(q) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [searchEvents]);

  const volumeOverTime = useMemo(() => {
    const map = new Map<string, number>();
    searchEvents.forEach(e => {
      const date = e.created_at.split('T')[0];
      map.set(date, (map.get(date) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([date, searches]) => ({ date, searches }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [searchEvents]);

  const handleExport = () => {
    exportToCSV(
      topQueries,
      [
        { header: 'Query', accessor: r => r.query },
        { header: 'Count', accessor: r => r.count },
      ],
      `search_analytics_${new Date().toISOString().split('T')[0]}.csv`
    );
    toast({ title: 'Exported', description: 'Search analytics exported as CSV.' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-accent" />
                Search Analytics
              </CardTitle>
              <CardDescription>What users are searching for ({searchEvents.length} total searches)</CardDescription>
            </div>
            {canExportCSV && (
              <Button size="sm" variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Queries Bar Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Top Search Queries</h4>
              {topQueries.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topQueries} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="query"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        width={120}
                        tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(213 50% 35%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No search data yet</p>
              )}
            </div>

            {/* Volume Over Time */}
            <div>
              <h4 className="text-sm font-medium mb-3">Search Volume Over Time</h4>
              {volumeOverTime.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="searches" stroke="hsl(166 76% 32%)" strokeWidth={2} dot={{ fill: 'hsl(166 76% 32%)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No search data yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
