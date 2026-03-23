import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, Download, Calendar, Search, BookOpen, ShieldX,
  TrendingUp, Filter, FileText, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UsageRow {
  title: string;
  searches: number;
  item_requests: number;
  access_denied: number;
  total: number;
}

interface MonthlySummary {
  month: string;
  searches: number;
  item_requests: number;
  access_denied: number;
}

export default function CounterReporting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('last-12');
  const [reportType, setReportType] = useState<'title' | 'monthly'>('title');

  // Fetch usage events from real database
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const monthsBack = dateRange === 'last-12' ? 12 : dateRange === 'last-6' ? 6 : 3;
        const since = new Date();
        since.setMonth(since.getMonth() - monthsBack);

        const { data, error } = await supabase
          .from('usage_events')
          .select('*')
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Usage events fetch error:', error.message);
          setEvents([]);
          toast({
            title: 'Data Access Notice',
            description: 'Unable to load usage data. Please ensure you are logged in with appropriate permissions.',
            variant: 'destructive',
          });
        } else {
          setEvents(data || []);
        }
      } catch {
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, [dateRange]);

  // Aggregate by title
  const titleReport: UsageRow[] = useMemo(() => {
    const map = new Map<string, UsageRow>();
    events.forEach(e => {
      const title = e.book_title || 'Unknown Title';
      const existing = map.get(title) || { title, searches: 0, item_requests: 0, access_denied: 0, total: 0 };
      if (e.event_type === 'search') existing.searches++;
      else if (e.event_type === 'item_request' || e.event_type === 'chapter_view') existing.item_requests++;
      else if (e.event_type === 'access_denied') existing.access_denied++;
      existing.total = existing.searches + existing.item_requests + existing.access_denied;
      map.set(title, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [events]);

  // Aggregate by month
  const monthlyReport: MonthlySummary[] = useMemo(() => {
    const map = new Map<string, MonthlySummary>();
    events.forEach(e => {
      const d = new Date(e.created_at);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const existing = map.get(month) || { month, searches: 0, item_requests: 0, access_denied: 0 };
      if (e.event_type === 'search') existing.searches++;
      else if (e.event_type === 'item_request' || e.event_type === 'chapter_view') existing.item_requests++;
      else if (e.event_type === 'access_denied') existing.access_denied++;
      map.set(month, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [events]);

  const totals = useMemo(() => ({
    searches: events.filter(e => e.event_type === 'search').length,
    item_requests: events.filter(e => e.event_type === 'item_request' || e.event_type === 'chapter_view').length,
    access_denied: events.filter(e => e.event_type === 'access_denied').length,
    total: events.length,
  }), [events]);

  // CSV export
  const handleExportCSV = () => {
    let csv = '';
    if (reportType === 'title') {
      csv = 'Title,Total_Item_Requests,Unique_Item_Investigations,No_License\n';
      titleReport.forEach(r => {
        csv += `"${r.title}",${r.item_requests},${r.searches},${r.access_denied}\n`;
      });
    } else {
      csv = 'Month,Total_Item_Requests,Unique_Item_Investigations,No_License\n';
      monthlyReport.forEach(r => {
        csv += `${r.month},${r.item_requests},${r.searches},${r.access_denied}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `COUNTER_5.1_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: `COUNTER 5.1 ${reportType} report downloaded as CSV.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-accent" />
                COUNTER 5.1 Usage Reports
              </h1>
              <p className="text-muted-foreground mt-1">
                Standardized usage reporting for librarians • Compliant with COUNTER Code of Practice Release 5.1
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/enterprise')}>
                Dashboard
              </Button>
              <Button onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container py-8 space-y-6">
        {/* Summary Cards */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.searches.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Unique Investigations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <BookOpen className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.item_requests.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Item Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <ShieldX className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.access_denied.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">No_License (Denied)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-wrap gap-4 items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Select value={reportType} onValueChange={(v: 'title' | 'monthly') => setReportType(v)}>
            <SelectTrigger className="w-[200px]">
              <FileText className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">TR_B1 — By Title</SelectItem>
              <SelectItem value="monthly">TR_B3 — By Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-3">Last 3 Months</SelectItem>
              <SelectItem value="last-6">Last 6 Months</SelectItem>
              <SelectItem value="last-12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="text-xs">
            COUNTER 5.1 Compliant
          </Badge>
        </motion.div>

        {/* Report Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {reportType === 'title' ? (
                  <>
                    <BookOpen className="h-5 w-5 text-accent" />
                    TR_B1: Book Requests (Excluding OA_Gold)
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5 text-accent" />
                    TR_B3: Book Usage by Access Type
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : reportType === 'title' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="text-right">Total_Item_Requests</TableHead>
                      <TableHead className="text-right">Unique_Item_Investigations</TableHead>
                      <TableHead className="text-right">No_License</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {titleReport.map((row) => (
                      <TableRow key={row.title}>
                        <TableCell className="font-medium max-w-[300px] truncate">{row.title}</TableCell>
                        <TableCell className="text-right">{row.item_requests}</TableCell>
                        <TableCell className="text-right">{row.searches}</TableCell>
                        <TableCell className="text-right">{row.access_denied}</TableCell>
                        <TableCell className="text-right font-semibold">{row.total}</TableCell>
                      </TableRow>
                    ))}
                    {titleReport.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No usage data available for the selected period.
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Totals row */}
                    {titleReport.length > 0 && (
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{totals.item_requests}</TableCell>
                        <TableCell className="text-right">{totals.searches}</TableCell>
                        <TableCell className="text-right">{totals.access_denied}</TableCell>
                        <TableCell className="text-right">{totals.total}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Total_Item_Requests</TableHead>
                      <TableHead className="text-right">Unique_Item_Investigations</TableHead>
                      <TableHead className="text-right">No_License</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyReport.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">{row.item_requests}</TableCell>
                        <TableCell className="text-right">{row.searches}</TableCell>
                        <TableCell className="text-right">{row.access_denied}</TableCell>
                      </TableRow>
                    ))}
                    {monthlyReport.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No usage data available for the selected period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* COUNTER 5.1 Info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              About COUNTER 5.1 Reporting
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>Total_Item_Requests:</strong> Number of times a content item (chapter/section) was accessed or downloaded.</p>
              <p>• <strong>Unique_Item_Investigations:</strong> Number of unique search queries that returned results for a title.</p>
              <p>• <strong>No_License:</strong> Access attempts denied due to lack of institutional license/entitlement.</p>
              <p>• Reports follow the COUNTER Code of Practice Release 5.1 standard for e-book usage.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
