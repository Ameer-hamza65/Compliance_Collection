import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Database, HardDrive, Shield, FileText, BookOpen, Loader2,
  Lock, Server, Layers, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

interface BookRecord {
  id: string;
  title: string;
  authors: string[];
  publisher: string | null;
  edition: string | null;
  published_year: number | null;
  isbn: string | null;
  specialty: string | null;
  file_path: string | null;
  file_type: string | null;
  chapter_count: number | null;
  created_at: string;
}

export default function RepositoryOverview() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageFiles, setStorageFiles] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [booksRes, storageRes] = await Promise.all([
        supabase.from('books').select('*').order('created_at', { ascending: false }),
        supabase.storage.from('book-files').list('', { limit: 100 }),
      ]);
      setBooks(booksRes.data || []);
      setStorageFiles(storageRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const totalFiles = storageFiles.length;
  const epubCount = books.filter(b => b.file_type === 'epub').length;
  const pdfCount = books.filter(b => b.file_type === 'pdf').length;

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Database className="h-6 w-6 text-accent" />
                Repository Architecture
              </h1>
              <p className="text-muted-foreground mt-1">
                Content infrastructure overview — storage, metadata, and security layers
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin/upload')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Upload Console
            </Button>
          </div>
        </div>
      </section>

      <main className="container py-8 space-y-6">
        {/* Architecture Summary Cards */}
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
                  <HardDrive className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalFiles}</p>
                  <p className="text-xs text-muted-foreground">Storage Objects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{books.length}</p>
                  <p className="text-xs text-muted-foreground">Cataloged Titles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <FileText className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{epubCount} / {pdfCount}</p>
                  <p className="text-xs text-muted-foreground">EPUB / PDF</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Lock className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Private</p>
                  <p className="text-xs text-muted-foreground">Bucket Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-accent" />
                Infrastructure Layers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Server className="h-4 w-4 text-accent" />
                    Storage Layer
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Private <code className="bg-muted px-1 rounded">book-files</code> bucket with RLS policies.
                    EPUB3 and PDF files stored as binary objects with path-based organization.
                  </p>
                  <Badge variant="outline" className="text-xs">RLS Protected</Badge>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Database className="h-4 w-4 text-accent" />
                    Metadata Layer
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PostgreSQL <code className="bg-muted px-1 rounded">books</code> table with structured fields:
                    title, authors, publisher, edition, year, ISBN, specialty, tags.
                    Linked <code className="bg-muted px-1 rounded">book_chapters</code> for granular content.
                  </p>
                  <Badge variant="outline" className="text-xs">Normalized Schema</Badge>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Shield className="h-4 w-4 text-accent" />
                    Access Control Layer
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Row-Level Security on all tables. Institutional entitlements via <code className="bg-muted px-1 rounded">book_access</code>.
                    Enterprise roles: admin, compliance_officer, department_manager, staff.
                  </p>
                  <Badge variant="outline" className="text-xs">Enterprise RBAC</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Books Metadata Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-accent" />
                Cataloged Titles &amp; Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No titles in repository yet. Use the Upload Console to ingest content.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Authors</TableHead>
                        <TableHead>Publisher</TableHead>
                        <TableHead>Edition</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>ISBN</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Chapters</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium max-w-[250px] truncate">{book.title}</TableCell>
                          <TableCell className="text-sm max-w-[150px] truncate">{book.authors?.join(', ') || '—'}</TableCell>
                          <TableCell className="text-sm">{book.publisher || '—'}</TableCell>
                          <TableCell className="text-sm">{book.edition || '—'}</TableCell>
                          <TableCell className="text-sm">{book.published_year || '—'}</TableCell>
                          <TableCell className="text-xs font-mono">{book.isbn || '—'}</TableCell>
                          <TableCell>
                            {book.specialty ? (
                              <Badge variant="secondary" className="text-xs">{book.specialty}</Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs uppercase">{book.file_type || 'epub'}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{book.chapter_count || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Files */}
        {storageFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HardDrive className="h-5 w-5 text-accent" />
                  Storage Bucket: book-files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storageFiles.map((file: any) => (
                      <TableRow key={file.id || file.name}>
                        <TableCell className="font-mono text-sm">{file.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {file.created_at ? new Date(file.created_at).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
