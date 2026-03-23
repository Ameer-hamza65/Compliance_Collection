import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, BookOpen, FolderOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEnterprise } from '@/context/EnterpriseContext';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  is_system_bundle: boolean;
  enterprise_id: string | null;
  book_count: number;
}

interface BookRow {
  id: string;
  title: string;
  specialty: string | null;
}

const CATEGORIES = ['Accreditation', 'Federal', 'Safety', 'Clinical', 'Administrative', 'Custom'];

const MAX_TITLES_PER_COLLECTION_BASIC = 10;
const MAX_COLLECTIONS_BASIC = 2;

export function CollectionManagement() {
  const { currentEnterprise, currentTier } = useEnterprise();
  const isUnlimitedTier = currentTier?.id === 'enterprise' || currentTier?.id === 'pro';
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [manageBooksFor, setManageBooksFor] = useState<Collection | null>(null);
  const [collectionBookIds, setCollectionBookIds] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({ name: '', description: '', category: 'Custom' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [collRes, booksRes] = await Promise.all([
      supabase.from('compliance_collections').select('*').order('name'),
      supabase.from('books').select('id, title, specialty').order('title'),
    ]);

    const collRows = collRes.data || [];
    // Get book counts
    const collIds = collRows.map(c => c.id);
    let countMap = new Map<string, number>();
    if (collIds.length > 0) {
      const { data: cbRows } = await supabase.from('collection_books').select('collection_id').in('collection_id', collIds);
      (cbRows || []).forEach(cb => countMap.set(cb.collection_id, (countMap.get(cb.collection_id) || 0) + 1));
    }

    setCollections(collRows.map(c => ({
      ...c,
      book_count: countMap.get(c.id) || 0,
    })));
    setBooks((booksRes.data || []) as BookRow[]);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    // Enforce collection limit for basic tier
    const customCollections = collections.filter(c => !c.is_system_bundle);
    if (!isUnlimitedTier && customCollections.length >= MAX_COLLECTIONS_BASIC) {
      toast.error(`Basic plan allows a maximum of ${MAX_COLLECTIONS_BASIC} custom collections. Upgrade to Pro or Enterprise for unlimited.`);
      return;
    }
    const { error } = await supabase.from('compliance_collections').insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      is_system_bundle: false,
      enterprise_id: currentEnterprise?.id || null,
    });
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('Collection created');
    setCreateOpen(false);
    setForm({ name: '', description: '', category: 'Custom' });
    loadData();
  };

  const handleUpdate = async () => {
    if (!editCollection) return;
    const { error } = await supabase.from('compliance_collections')
      .update({ name: form.name.trim(), description: form.description.trim() || null, category: form.category })
      .eq('id', editCollection.id);
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('Collection updated');
    setEditCollection(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    await supabase.from('collection_books').delete().eq('collection_id', id);
    const { error } = await supabase.from('compliance_collections').delete().eq('id', id);
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('Collection deleted');
    loadData();
  };

  const openManageBooks = async (coll: Collection) => {
    setManageBooksFor(coll);
    const { data } = await supabase.from('collection_books').select('book_id').eq('collection_id', coll.id);
    setCollectionBookIds(new Set((data || []).map(cb => cb.book_id)));
  };

  const toggleBook = async (bookId: string) => {
    if (!manageBooksFor) return;
    const inCollection = collectionBookIds.has(bookId);
    if (inCollection) {
      await supabase.from('collection_books').delete().eq('collection_id', manageBooksFor.id).eq('book_id', bookId);
      setCollectionBookIds(prev => { const s = new Set(prev); s.delete(bookId); return s; });
    } else {
      // Enforce title limit for basic tier
      if (!isUnlimitedTier && collectionBookIds.size >= MAX_TITLES_PER_COLLECTION_BASIC) {
        toast.error(`Basic plan allows a maximum of ${MAX_TITLES_PER_COLLECTION_BASIC} titles per collection. Upgrade for unlimited.`);
        return;
      }
      await supabase.from('collection_books').insert({ collection_id: manageBooksFor.id, book_id: bookId });
      setCollectionBookIds(prev => new Set(prev).add(bookId));
    }
  };

  const openEdit = (coll: Collection) => {
    setForm({ name: coll.name, description: coll.description || '', category: coll.category });
    setEditCollection(coll);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Collection Management</h2>
          <p className="text-sm text-muted-foreground">Create, edit, and manage compliance collections and their titles.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { setForm({ name: '', description: '', category: 'Custom' }); setCreateOpen(true); }} className="gap-2"
            disabled={!isUnlimitedTier && collections.filter(c => !c.is_system_bundle).length >= MAX_COLLECTIONS_BASIC}>
            <Plus className="h-4 w-4" /> New Collection
          </Button>
          {!isUnlimitedTier && (
            <span className="text-xs text-muted-foreground">
              {collections.filter(c => !c.is_system_bundle).length}/{MAX_COLLECTIONS_BASIC} collections used
            </span>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Titles</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map(coll => (
                <TableRow key={coll.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{coll.name}</p>
                      {coll.description && <p className="text-xs text-muted-foreground truncate max-w-[250px]">{coll.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{coll.category}</Badge></TableCell>
                  <TableCell className="text-center">{coll.book_count}</TableCell>
                  <TableCell>
                    <Badge variant={coll.is_system_bundle ? 'default' : 'outline'} className="text-xs">
                      {coll.is_system_bundle ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openManageBooks(coll)} title="Manage books">
                        <BookOpen className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(coll)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!coll.is_system_bundle && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(coll.id)} title="Delete" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-accent" /> New Collection</DialogTitle>
            <DialogDescription>Create a new compliance collection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Collection name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleCreate}>Create Collection</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCollection} onOpenChange={() => setEditCollection(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Books Dialog */}
      <Dialog open={!!manageBooksFor} onOpenChange={() => setManageBooksFor(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manage Titles — {manageBooksFor?.name}</DialogTitle>
            <DialogDescription>Toggle books in/out of this collection.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[50vh] space-y-1 mt-2">
            {books.map(b => (
              <div
                key={b.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors ${collectionBookIds.has(b.id) ? 'bg-accent/10' : ''}`}
                onClick={() => toggleBook(b.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.title}</p>
                  {b.specialty && <p className="text-xs text-muted-foreground">{b.specialty}</p>}
                </div>
                <Badge variant={collectionBookIds.has(b.id) ? 'default' : 'outline'} className="text-xs ml-2">
                  {collectionBookIds.has(b.id) ? 'In Collection' : 'Add'}
                </Badge>
              </div>
            ))}
            {books.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No books in repository yet.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
