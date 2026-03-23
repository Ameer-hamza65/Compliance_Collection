import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Building2, Users, BookOpen, Shield, Activity, 
  BarChart3, Globe, Sparkles, Crown, ChevronRight, 
  AlertTriangle, CheckCircle, Plus, Mail, Edit, 
  Power, MessageSquare, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface EnterpriseRow {
  id: string;
  name: string;
  type: string;
  domain: string | null;
  license_seats: number;
  used_seats: number;
  licensing_tier: string | null;
  logo_color: string | null;
  contact_email: string | null;
  created_at: string;
  is_active: boolean;
}

interface QuoteRequest {
  id: string;
  institution_name: string;
  contact_name: string;
  contact_email: string;
  domain: string | null;
  tier_requested: string;
  estimated_users: number;
  message: string | null;
  status: string;
  created_at: string;
}

interface SystemStats {
  totalEnterprises: number;
  totalUsers: number;
  totalBooks: number;
  totalAiQueries: number;
  totalUsageEvents: number;
}

// ─── Create Enterprise Dialog ─────────────────────────────────────
function CreateEnterpriseDialog({ open, onOpenChange, onCreated, prefill }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
  prefill?: { name?: string; email?: string; tier?: string; seats?: number; domain?: string };
}) {
  const [form, setForm] = useState({
    name: prefill?.name || '',
    domain: '',
    contact_email: prefill?.email || '',
    type: 'hospital' as string,
    licensing_tier: prefill?.tier || 'basic',
    license_seats: prefill?.seats || 25,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefill) {
      setForm(f => ({
        ...f,
        name: prefill.name || f.name,
        domain: prefill.domain || f.domain,
        contact_email: prefill.email || f.contact_email,
        licensing_tier: prefill.tier || f.licensing_tier,
        license_seats: prefill.seats || f.license_seats,
      }));
    }
  }, [prefill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Enterprise name is required'); return; }
    setSaving(true);

    const { data: ent, error } = await supabase.from('enterprises').insert({
      name: form.name.trim(),
      domain: form.domain.trim() || null,
      contact_email: form.contact_email.trim() || null,
      type: form.type as any,
      licensing_tier: form.licensing_tier,
      license_seats: form.license_seats,
    }).select().single();

    if (error) { toast.error('Failed to create enterprise'); setSaving(false); return; }

    // Create subscription via RPC
    const { error: subError } = await supabase.rpc('create_subscription', {
      p_enterprise_id: ent.id,
      p_plan_type: form.licensing_tier,
      p_seats: form.license_seats,
    });
    if (subError) console.error('Subscription RPC error:', subError);

    toast.success(`Enterprise "${form.name}" created`);
    setSaving(false);
    onOpenChange(false);
    setForm({ name: '', domain: '', contact_email: '', type: 'hospital', licensing_tier: 'basic', license_seats: 25 });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-accent" /> Create Enterprise</DialogTitle>
          <DialogDescription>Provision a new institutional account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Enterprise Name *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sarasota Memorial Hospital" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email Domain</Label>
              <Input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} placeholder="smh.com" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="admin@smh.com" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="medical_school">Medical School</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={form.licensing_tier} onValueChange={v => setForm(f => ({ ...f, licensing_tier: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Seats</Label>
              <Input type="number" min={1} value={form.license_seats} onChange={e => setForm(f => ({ ...f, license_seats: parseInt(e.target.value) || 1 }))} />
            </div>
          </div>
          <Button type="submit" variant="cta" className="w-full" disabled={saving}>
            {saving ? 'Creating…' : 'Create Enterprise'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Enterprise Dialog ───────────────────────────────────────
function EditEnterpriseDialog({ enterprise, open, onOpenChange, onSaved }: {
  enterprise: EnterpriseRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const [tier, setTier] = useState(enterprise?.licensing_tier || 'basic');
  const [seats, setSeats] = useState(enterprise?.license_seats || 25);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (enterprise) {
      setTier(enterprise.licensing_tier || 'basic');
      setSeats(enterprise.license_seats);
    }
  }, [enterprise]);

  const handleSave = async () => {
    if (!enterprise) return;
    setSaving(true);
    // Use RPC for seat recovery logic
    const { error } = await supabase.rpc('update_subscription', {
      p_enterprise_id: enterprise.id,
      p_new_seats: seats,
      p_new_plan: tier,
    });
    if (error) { toast.error('Failed to update: ' + error.message); setSaving(false); return; }
    toast.success('Enterprise updated');
    setSaving(false);
    onOpenChange(false);
    onSaved();
  };

  if (!enterprise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-accent" /> Edit {enterprise.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Licensing Tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>License Seats</Label>
            <Input type="number" min={1} value={seats} onChange={e => setSeats(parseInt(e.target.value) || 1)} />
          </div>
          <Button variant="cta" className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [enterprises, setEnterprises] = useState<EnterpriseRow[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [stats, setStats] = useState<SystemStats>({ totalEnterprises: 0, totalUsers: 0, totalBooks: 0, totalAiQueries: 0, totalUsageEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(null);
  const [enterpriseUsers, setEnterpriseUsers] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEnt, setEditEnt] = useState<EnterpriseRow | null>(null);
  const [createPrefill, setCreatePrefill] = useState<any>(undefined);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [entRes, profilesRes, booksRes, aiRes, eventsRes, quotesRes] = await Promise.all([
      supabase.from('enterprises').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('ai_query_logs').select('id', { count: 'exact', head: true }),
      supabase.from('usage_events').select('id', { count: 'exact', head: true }),
      supabase.from('quote_requests' as any).select('*').order('created_at', { ascending: false }),
    ]);

    setEnterprises((entRes.data as EnterpriseRow[]) || []);
    setQuoteRequests((quotesRes.data as unknown as QuoteRequest[]) || []);
    setStats({
      totalEnterprises: entRes.data?.length || 0,
      totalUsers: profilesRes.count || 0,
      totalBooks: booksRes.count || 0,
      totalAiQueries: aiRes.count || 0,
      totalUsageEvents: eventsRes.count || 0,
    });
    setLoading(false);
  };

  const loadEnterpriseUsers = async (enterpriseId: string) => {
    setSelectedEnterprise(enterpriseId);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('enterprise_id', enterpriseId)
      .order('created_at', { ascending: false });
    setEnterpriseUsers(data || []);
  };

  const toggleEnterprise = async (ent: EnterpriseRow) => {
    const newStatus = !ent.is_active;
    await supabase.from('enterprises').update({ is_active: newStatus } as any).eq('id', ent.id);
    toast.success(`${ent.name} ${newStatus ? 'activated' : 'suspended'}`);
    loadData();
  };

  const promoteToAdmin = async (userId: string, userName: string) => {
    const { error } = await supabase.rpc('assign_role', {
      p_user_id: userId,
      p_new_role: 'admin',
    });
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success(`${userName} promoted to admin`);
    if (selectedEnterprise) loadEnterpriseUsers(selectedEnterprise);
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    await supabase.from('quote_requests' as any).update({ status } as any).eq('id', id);
    toast.success(`Quote marked as ${status}`);
    loadData();
  };

  const convertQuoteToEnterprise = (q: QuoteRequest) => {
    setCreatePrefill({ name: q.institution_name, email: q.contact_email, tier: q.tier_requested, seats: q.estimated_users, domain: q.domain });
    setCreateOpen(true);
    updateQuoteStatus(q.id, 'converted');
  };

  const tierColor = (tier: string | null) => {
    switch (tier) {
      case 'enterprise': return 'bg-accent/10 text-accent border-accent/20';
      case 'pro': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'contacted': return 'bg-primary/10 text-primary border-primary/20';
      case 'converted': return 'bg-accent/10 text-accent border-accent/20';
      case 'closed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const pendingQuotes = quoteRequests.filter(q => q.status === 'pending').length;
  const selectedEnt = enterprises.find(e => e.id === selectedEnterprise);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="medical-gradient">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                  <Globe className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Platform Administration</h1>
                  <p className="text-muted-foreground text-sm">Super Admin Dashboard — All Enterprises</p>
                </div>
              </div>
              <Button variant="cta" onClick={() => { setCreatePrefill(undefined); setCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Create Enterprise
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* System-Wide Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          {[
            { label: 'Enterprises', value: stats.totalEnterprises, icon: Building2 },
            { label: 'Total Users', value: stats.totalUsers, icon: Users },
            { label: 'Total Books', value: stats.totalBooks, icon: BookOpen },
            { label: 'AI Queries', value: stats.totalAiQueries, icon: Sparkles },
            { label: 'Usage Events', value: stats.totalUsageEvents, icon: Activity },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{loading ? '...' : stat.value.toLocaleString()}</p>
                  </div>
                  <stat.icon className="h-10 w-10 text-accent/60" />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="enterprises" className="space-y-6">
          <TabsList>
            <TabsTrigger value="enterprises" className="gap-2">
              <Building2 className="h-4 w-4" /> Enterprises
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Quote Requests
              {pendingQuotes > 0 && (
                <Badge className="ml-1 bg-destructive text-destructive-foreground text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {pendingQuotes}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" /> System Analytics
            </TabsTrigger>
          </TabsList>

          {/* ── Enterprises Tab ── */}
          <TabsContent value="enterprises" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" /> All Enterprises ({enterprises.length})
                    </CardTitle>
                    <CardDescription>Click an enterprise to view details. Use actions to edit or suspend.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Enterprise</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Seats</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enterprises.map((ent) => {
                          const seatPct = ent.license_seats > 0 ? Math.round((ent.used_seats / ent.license_seats) * 100) : 0;
                          return (
                            <TableRow 
                              key={ent.id} 
                              className={`cursor-pointer transition-colors ${selectedEnterprise === ent.id ? 'bg-accent/5' : 'hover:bg-muted/50'}`}
                              onClick={() => loadEnterpriseUsers(ent.id)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: ent.logo_color || 'hsl(213 50% 35%)' }}
                                  >
                                    {ent.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{ent.name}</p>
                                    <p className="text-xs text-muted-foreground">{ent.domain || '—'}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={tierColor(ent.licensing_tier)}>
                                  {ent.licensing_tier || 'basic'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="text-sm">{ent.used_seats}/{ent.license_seats}</p>
                                  <Progress value={seatPct} className={`h-1 ${seatPct >= 90 ? '[&>div]:bg-destructive' : ''}`} />
                                </div>
                              </TableCell>
                              <TableCell>
                                {ent.is_active ? (
                                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs">Active</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Suspended</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditEnt(ent)}>
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleEnterprise(ent)}>
                                    <Power className={`h-3.5 w-3.5 ${ent.is_active ? 'text-destructive' : 'text-accent'}`} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {enterprises.length === 0 && !loading && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No enterprises found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Enterprise Detail Panel */}
              <div>
                {selectedEnt ? (
                  <Card className="sticky top-24">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: selectedEnt.logo_color || 'hsl(213 50% 35%)' }}>
                          {selectedEnt.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{selectedEnt.name}</CardTitle>
                          <CardDescription>{selectedEnt.domain}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-muted-foreground">Type</p><p className="font-medium">{selectedEnt.type}</p></div>
                        <div><p className="text-muted-foreground">Tier</p><Badge variant="outline" className={tierColor(selectedEnt.licensing_tier)}>{selectedEnt.licensing_tier || 'basic'}</Badge></div>
                        <div><p className="text-muted-foreground">Seats</p><p className="font-medium">{selectedEnt.used_seats}/{selectedEnt.license_seats}</p></div>
                        <div><p className="text-muted-foreground">Contact</p><p className="font-medium text-xs truncate">{selectedEnt.contact_email || '—'}</p></div>
                        <div className="col-span-2"><p className="text-muted-foreground">Created</p><p className="font-medium">{new Date(selectedEnt.created_at).toLocaleDateString()}</p></div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Users ({enterpriseUsers.length})</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {enterpriseUsers.map((u: any) => (
                            <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div>
                                <p className="text-sm font-medium">{u.full_name || u.email.split('@')[0]}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{u.role}</Badge>
                                {u.role !== 'admin' && (
                                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" 
                                    onClick={() => promoteToAdmin(u.id, u.full_name || u.email)}>
                                    <Crown className="h-3 w-3 mr-1" /> Promote
                                  </Button>
                                )}
                                {u.is_active ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-accent" />
                                ) : (
                                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                )}
                              </div>
                            </div>
                          ))}
                          {enterpriseUsers.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">No users</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="sticky top-24">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="text-sm">Select an enterprise to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Quote Requests Tab ── */}
          <TabsContent value="quotes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Quote Requests ({quoteRequests.length})
                </CardTitle>
                <CardDescription>Incoming quote requests from the pricing page</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteRequests.map(q => (
                      <TableRow key={q.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{q.institution_name}</p>
                          {q.domain && <p className="text-xs text-accent">@{q.domain}</p>}
                          {q.message && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{q.message}</p>}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{q.contact_name}</p>
                          <p className="text-xs text-muted-foreground">{q.contact_email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={tierColor(q.tier_requested)}>{q.tier_requested}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{q.estimated_users}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColor(q.status)}>{q.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {q.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => updateQuoteStatus(q.id, 'contacted')}>
                                  <Mail className="h-3 w-3 mr-1" /> Contacted
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-accent" onClick={() => convertQuoteToEnterprise(q)}>
                                  <ArrowRight className="h-3 w-3 mr-1" /> Convert
                                </Button>
                              </>
                            )}
                            {q.status === 'contacted' && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-accent" onClick={() => convertQuoteToEnterprise(q)}>
                                <ArrowRight className="h-3 w-3 mr-1" /> Convert
                              </Button>
                            )}
                            {(q.status === 'pending' || q.status === 'contacted') && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => updateQuoteStatus(q.id, 'closed')}>
                                Close
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {quoteRequests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No quote requests yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Analytics Tab ── */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Seat Utilization by Enterprise</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enterprises.map(ent => {
                      const pct = ent.license_seats > 0 ? Math.round((ent.used_seats / ent.license_seats) * 100) : 0;
                      return (
                        <div key={ent.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{ent.name}</span>
                            <span className="text-muted-foreground">{ent.used_seats}/{ent.license_seats} ({pct}%)</span>
                          </div>
                          <Progress value={pct} className={`h-2 ${pct >= 90 ? '[&>div]:bg-destructive' : pct >= 75 ? '[&>div]:bg-warning' : ''}`} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Tier Distribution</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['enterprise', 'pro', 'basic'].map(tier => {
                      const count = enterprises.filter(e => (e.licensing_tier || 'basic') === tier).length;
                      return (
                        <div key={tier} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-accent" />
                            <span className="font-medium capitalize">{tier}</span>
                          </div>
                          <Badge variant="outline">{count} {count === 1 ? 'enterprise' : 'enterprises'}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateEnterpriseDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={loadData} prefill={createPrefill} />
      <EditEnterpriseDialog enterprise={editEnt} open={!!editEnt} onOpenChange={(o) => { if (!o) setEditEnt(null); }} onSaved={loadData} />
    </div>
  );
}
