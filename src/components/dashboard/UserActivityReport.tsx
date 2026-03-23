import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Users, Lock } from 'lucide-react';
import { exportToCSV } from '@/lib/csvExport';
import { useToast } from '@/hooks/use-toast';
import type { UserActivity } from '@/hooks/useUsageAggregation';

interface UserActivityReportProps {
  userActivity: UserActivity[];
  canExportCSV: boolean;
  canViewUsers: boolean;
}

export function UserActivityReport({ userActivity, canExportCSV, canViewUsers }: UserActivityReportProps) {
  const { toast } = useToast();

  if (!canViewUsers) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            User Activity Report
          </CardTitle>
          <CardDescription className="text-warning">
            Individual user tracking requires Pro plan or higher.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleExport = () => {
    exportToCSV(
      userActivity,
      [
        { header: 'User ID', accessor: (r) => r.userId },
        { header: 'Name', accessor: (r) => r.fullName },
        { header: 'Department', accessor: (r) => r.department },
        { header: 'Views', accessor: (r) => r.views },
        { header: 'AI Queries', accessor: (r) => r.aiQueries },
        { header: 'Last Access', accessor: (r) => new Date(r.lastAccess).toLocaleDateString() },
      ],
      `user_activity_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    toast({ title: 'Report Exported', description: 'User activity report downloaded as CSV.' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              User Activity Report
            </CardTitle>
            <CardDescription>Individual user engagement metrics</CardDescription>
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
              <TableHead>User</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">AI Queries</TableHead>
              <TableHead className="text-right">Last Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userActivity.length > 0 ? userActivity.slice(0, 25).map(user => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.fullName || user.userId.slice(0, 8)}</TableCell>
                <TableCell className="text-muted-foreground">{user.department}</TableCell>
                <TableCell className="text-right">{user.views}</TableCell>
                <TableCell className="text-right">{user.aiQueries}</TableCell>
                <TableCell className="text-right text-sm">{new Date(user.lastAccess).toLocaleDateString()}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No user activity for the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
