import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Sparkles, Lock } from 'lucide-react';
import { exportToCSV } from '@/lib/csvExport';
import { useToast } from '@/hooks/use-toast';

interface AILog {
  id: string;
  query_type: string;
  book_title: string;
  chapter_title: string;
  response_time_ms: number;
  created_at: string;
}

interface AIUsageReportProps {
  aiLogs: AILog[];
  canExportCSV: boolean;
}

export function AIUsageReport({ aiLogs, canExportCSV }: AIUsageReportProps) {
  const { toast } = useToast();

  const handleExport = () => {
    exportToCSV(
      aiLogs,
      [
        { header: 'Date', accessor: (r) => new Date(r.created_at).toLocaleDateString() },
        { header: 'Query Type', accessor: (r) => r.query_type },
        { header: 'Book Title', accessor: (r) => r.book_title },
        { header: 'Chapter Title', accessor: (r) => r.chapter_title },
        { header: 'Response Time (ms)', accessor: (r) => r.response_time_ms },
      ],
      `ai_usage_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    toast({ title: 'Report Exported', description: 'AI usage report downloaded as CSV.' });
  };

  const avgTime = aiLogs.length > 0
    ? (aiLogs.reduce((s, l) => s + l.response_time_ms, 0) / aiLogs.length / 1000).toFixed(1)
    : '0';

  const typeBreakdown = aiLogs.reduce<Record<string, number>>((acc, l) => {
    acc[l.query_type] = (acc[l.query_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Usage Report
            </CardTitle>
            <CardDescription>AI query activity breakdown</CardDescription>
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
            <p className="text-2xl font-bold">{aiLogs.length.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total AI Queries</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{avgTime}s</p>
            <p className="text-xs text-muted-foreground">Avg Response</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{Object.keys(typeBreakdown).length}</p>
            <p className="text-xs text-muted-foreground">Query Types</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(typeBreakdown).map(([type, count]) => (
            <Badge key={type} variant="secondary" className="capitalize">
              {type}: {count}
            </Badge>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Book</TableHead>
              <TableHead>Chapter</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aiLogs.slice(0, 20).map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-xs">{new Date(log.created_at).toLocaleDateString()}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs capitalize">{log.query_type}</Badge></TableCell>
                <TableCell className="font-medium max-w-[200px] truncate text-sm">{log.book_title}</TableCell>
                <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">{log.chapter_title}</TableCell>
                <TableCell className="text-right text-sm">{(log.response_time_ms / 1000).toFixed(1)}s</TableCell>
              </TableRow>
            ))}
            {aiLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No AI queries for the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
