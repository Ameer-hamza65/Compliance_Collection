import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Lock } from 'lucide-react';
import { exportToCSV } from '@/lib/csvExport';
import { useToast } from '@/hooks/use-toast';
import type { AggregatedStats } from '@/hooks/useUsageAggregation';

interface UsageReportProps {
  stats: AggregatedStats;
  canExportCSV: boolean;
}

export function UsageReport({ stats, canExportCSV }: UsageReportProps) {
  const { toast } = useToast();

  const handleExport = () => {
    exportToCSV(
      stats.topBooks,
      [
        { header: 'Title', accessor: (r) => r.title },
        { header: 'Views', accessor: (r) => r.views },
      ],
      `usage_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    toast({ title: 'Report Exported', description: 'Usage report downloaded as CSV.' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Usage Report
            </CardTitle>
            <CardDescription>Content access by title</CardDescription>
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
        <div className="flex gap-6 mb-4">
          <div>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalSearches.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Searches</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalAccessDenied.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Access Denied</p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.topBooks.length > 0 ? stats.topBooks.map((book, i) => (
              <TableRow key={book.bookId}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">{book.title}</TableCell>
                <TableCell className="text-right">{book.views.toLocaleString()}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No usage data for the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
