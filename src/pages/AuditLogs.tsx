import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEnterprise } from '@/context/EnterpriseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Building2, Search, Download, Filter, BookOpen, FileText,
  LogIn, LogOut, FolderOpen, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '@/lib/csvExport';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_title: string | null;
  metadata: any;
  created_at: string;
  ip_address: string | null;
  enterprise_id: string | null;
  // joined
  user_name?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  view_book: <BookOpen className="h-4 w-4" />,
  view_chapter: <FileText className="h-4 w-4" />,
  search: <Search className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  access_collection: <FolderOpen className="h-4 w-4" />,
  request_addon: <BookOpen className="h-4 w-4" />,
  page_view: <Eye className="h-4 w-4" />,
};

const actionLabels: Record<string, string> = {
  view_book: 'Viewed Book',
  view_chapter: 'Viewed Chapter',
  search: 'Search',
  download: 'Download',
  login: 'Login',
  logout: 'Logout',
  access_collection: 'Accessed Collection',
  request_addon: 'Add-On Request',
  page_view: 'Page View',
};

export default function AuditLogs() {
  const navigate = useNavigate();
  const { currentEnterprise, isEnterpriseMode, isAdmin, isComplianceOfficer } = useEnterprise();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7days');

  useEffect(() => {
    if (!currentEnterprise) return;
    fetchLogs();
  }, [currentEnterprise, dateFilter]);

  const fetchLogs = async () => {
    if (!currentEnterprise) return;
    setLoading(true);
    
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('enterprise_id', currentEnterprise.id)
      .order('created_at', { ascending: false })
      .limit(500);

    // Date filter
    const now = new Date();
    if (dateFilter === '24hours') {
      query = query.gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());
    } else if (dateFilter === '7days') {
      query = query.gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());
    } else if (dateFilter === '30days') {
      query = query.gte('created_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());
    }

    const { data } = await query;
    
    // Resolve user names
    const userIds = [...new Set((data || []).map(l => l.user_id).filter(Boolean))];
    let userMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds as string[]);
      (profiles || []).forEach(p => {
        userMap.set(p.id, p.full_name || p.email);
      });
    }

    setLogs((data || []).map(l => ({
      ...l,
      user_name: l.user_id ? userMap.get(l.user_id) || 'Unknown' : 'System',
    })));
    setLoading(false);
  };

  if (!isEnterpriseMode || !currentEnterprise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Enterprise Access Required</CardTitle>
            <CardDescription>Please log in with an enterprise account to view audit logs.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin() && !isComplianceOfficer()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>Audit logs are only accessible to administrators and compliance officers.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/enterprise')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !(log.user_name || '').toLowerCase().includes(q) &&
        !(log.target_title || '').toLowerCase().includes(q) &&
        !(log.metadata?.query || '').toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleExport = () => {
    const rows = filteredLogs.map(l => ({
      Date: new Date(l.created_at).toLocaleDateString(),
      Time: new Date(l.created_at).toLocaleTimeString(),
      User: l.user_name || '',
      Action: actionLabels[l.action] || l.action,
      Target: l.target_title || '',
      IP: l.ip_address || '',
    }));
    exportToCSV(
      rows,
      [
        { header: 'Date', accessor: (r: typeof rows[0]) => r.Date },
        { header: 'Time', accessor: (r: typeof rows[0]) => r.Time },
        { header: 'User', accessor: (r: typeof rows[0]) => r.User },
        { header: 'Action', accessor: (r: typeof rows[0]) => r.Action },
        { header: 'Target', accessor: (r: typeof rows[0]) => r.Target },
        { header: 'IP', accessor: (r: typeof rows[0]) => r.IP },
      ],
      'audit-logs'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="medical-gradient">
        <div className="container mx-auto px-4 py-6">
          <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
              <p className="text-muted-foreground">{currentEnterprise.name}</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/enterprise')}>Back to Dashboard</Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="mb-6 glass-card">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by user, content, or query..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="view_book">View Book</SelectItem>
                    <SelectItem value="view_chapter">View Chapter</SelectItem>
                    <SelectItem value="search">Search</SelectItem>
                    <SelectItem value="access_collection">Access Collection</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24hours">Last 24 hours</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `Showing ${filteredLogs.length} entries`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[180px]">User</TableHead>
                      <TableHead className="w-[140px]">Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-[120px]">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {loading ? 'Loading audit logs...' : 'No audit log entries found matching your filters.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => {
                        const { date, time } = formatTimestamp(log.created_at);
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="text-sm">{date}</div>
                              <div className="text-xs text-muted-foreground">{time}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{log.user_name}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="gap-1">
                                {actionIcons[log.action] || <Eye className="h-4 w-4" />}
                                {actionLabels[log.action] || log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.target_title && <div className="text-sm">{log.target_title}</div>}
                              {log.metadata?.query && (
                                <div className="text-sm">
                                  Query: "<span className="font-medium">{log.metadata.query}</span>"
                                  {log.metadata.results && <span className="text-muted-foreground"> ({log.metadata.results} results)</span>}
                                </div>
                              )}
                              {!log.target_title && !log.metadata?.query && <span className="text-muted-foreground text-sm">—</span>}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground font-mono">{log.ip_address || '—'}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
