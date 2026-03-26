import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Book, TrendingUp, Shield, FolderOpen, ArrowRight, CheckCircle, Sparkles, Activity, Database } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { TrendingTopics } from '@/components/TrendingTopics';
import { AISearchResults } from '@/components/AISearchResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useUser } from '@/context/UserContext';
import { useEnterprise } from '@/context/EnterpriseContext';
import { useBooks } from '@/context/BookContext';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';



// Animated section wrapper
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const { user, hasFullAccess } = useUser();
  const { isEnterpriseMode, isPlatformAdmin, collections, currentUser: enterpriseUser } = useEnterprise();
  const { books, totalBooks } = useBooks();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const [aiRecommendations, setAiRecommendations] = useState<Array<{ bookId: string; title: string; reason: string; specialty: string; collection?: string; relevanceScore?: number; chapters?: Array<{ id: string; title: string; reason: string }> }>>([]);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);

  const handleSearch = useCallback(async (query: string, filters?: { publisher?: string; specialty?: string; edition?: string }) => {
    setSearchQuery(query);
    setHasSearched(true);
    setAiSearchLoading(true);
    setAiRecommendations([]);

    // Log search_query event (fire-and-forget)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id || null;
      if (userId) {
        supabase.from('profiles').select('enterprise_id').eq('id', userId).maybeSingle().then(({ data: profile }) => {
          supabase.from('usage_events').insert([{
            event_type: 'search',
            user_id: userId,
            enterprise_id: profile?.enterprise_id || null,
            metadata: { query, filters },
          }]).then(() => {});
        });
      }
    });

    // Build filter-augmented prompt
    const filterParts: string[] = [];
    if (filters?.publisher) filterParts.push(`Publisher: ${filters.publisher}`);
    if (filters?.specialty) filterParts.push(`Specialty: ${filters.specialty}`);
    if (filters?.edition) filterParts.push(`Edition: ${filters.edition}`);
    const filterInstruction = filterParts.length > 0
      ? `\n\nIMPORTANT FILTERS — Only include results matching ALL of these criteria:\n${filterParts.join('\n')}\nIf a book does not match the filter criteria, exclude it from results.`
      : '';

    // AI search — the only search mechanism
    try {
      const bookCatalog = books.map(b => ({
        id: b.id,
        title: b.title,
        specialty: b.specialty,
        publisher: b.publisher || 'Unknown',
        edition: b.edition || '',
        description: b.description.slice(0, 200),
        tags: b.tags?.slice(0, 8) || [],
        year: b.publishedYear,
        chapters: b.tableOfContents.slice(0, 15).map(ch => ({ id: ch.id, title: ch.title })),
      }));

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt: query + filterInstruction,
          chapterContent: JSON.stringify(bookCatalog),
          chapterTitle: 'Book Catalog',
          bookTitle: 'Compliance Collections Library',
          type: 'search',
          filters: filters || {},
          userId: user.id || null,
          enterpriseId: user.enterpriseId || null,
        },
      });

      if (error) {
        const errMsg = typeof data === 'object' && data?.error ? data.error : error.message;
        if (errMsg?.includes('Rate limit') || errMsg?.includes('429')) {
          toast({ title: 'AI Busy', description: 'AI search is temporarily rate-limited. Please try again in a moment.', variant: 'destructive' });
        }
        setAiRecommendations([]);
      } else if (data?.results && Array.isArray(data.results)) {
        setAiRecommendations(data.results.slice(0, 8).map((r: any) => ({
          bookId: r.bookId || '',
          title: r.title || '',
          reason: r.reason || '',
          specialty: r.specialty || '',
          collection: r.collection || null,
          relevanceScore: r.relevanceScore || 0,
          chapters: r.chapters || [],
        })));
      } else if (data?.content) {
        try {
          const parsed = JSON.parse(data.content);
          const arr = Array.isArray(parsed) ? parsed : (parsed.bookId || parsed.title) ? [parsed] : parsed.results || [];
          setAiRecommendations(arr.slice(0, 8).map((r: any) => ({
            bookId: r.bookId || '',
            title: r.title || '',
            reason: r.reason || '',
            specialty: r.specialty || '',
            collection: r.collection || null,
            relevanceScore: r.relevanceScore || 0,
            chapters: r.chapters || [],
          })));
        } catch {
          // Try regex extraction
          try {
            const arrayMatch = data.content.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
              setAiRecommendations(JSON.parse(arrayMatch[0]).slice(0, 8));
            } else {
              const objMatch = data.content.match(/\{[\s\S]*\}/);
              if (objMatch) {
                const obj = JSON.parse(objMatch[0]);
                if (obj.bookId || obj.title) setAiRecommendations([obj]);
              }
            }
          } catch {
            setAiRecommendations([]);
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('429') || msg.includes('Rate limit')) {
        toast({ title: 'AI Busy', description: 'AI search is temporarily rate-limited. Please try again in a moment.', variant: 'destructive' });
      }
      setAiRecommendations([]);
    } finally {
      setAiSearchLoading(false);
    }
  }, [books, user.id, user.enterpriseId, toast]);

  const trackSearchClick = useCallback((bookId: string, bookTitle: string, source: 'regular' | 'ai', chapterId?: string) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id || null;
      if (!userId) return;
      supabase.from('profiles').select('enterprise_id').eq('id', userId).maybeSingle().then(({ data: profile }) => {
        supabase.from('usage_events').insert([{
          event_type: 'search_result_click',
          user_id: userId,
          enterprise_id: profile?.enterprise_id || null,
          book_title: bookTitle,
          metadata: { query: searchQuery, book_id: bookId, chapter_id: chapterId || null, source },
        }]).then(() => {});
      });
    });
  }, [searchQuery]);

  const handleViewChapter = useCallback((bookId: string, chapterId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      trackSearchClick(book.id, book.title, 'ai', chapterId);
      navigate(`/reader?book=${book.id}&chapter=${chapterId}`);
    }
  }, [books, navigate, trackSearchClick]);

  const handleViewBook = useCallback((bookId: string, title?: string) => {
    const book = books.find(b => b.id === bookId);
    if (book && book.tableOfContents.length > 0) {
      trackSearchClick(book.id, title || book.title, 'ai');
      navigate(`/reader?book=${book.id}&chapter=${book.tableOfContents[0].id}`);
    }
  }, [books, navigate, trackSearchClick]);

  const totalChapters = useMemo(() =>
    books.reduce((sum, book) => sum + book.tableOfContents.length, 0), [books]
  );

  const regulatoryBadges = [
    { label: 'JCAHO', desc: 'Joint Commission' },
    { label: 'CMS', desc: 'Centers for Medicare' },
    { label: 'OSHA', desc: 'Workplace Safety' },
    { label: 'AORN', desc: 'Perioperative Standards' },
    { label: 'AAMI', desc: 'Medical Instrumentation' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Animated background mesh */}
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[150px]" />
        </div>
        
        <div className="container max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm mb-8"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">AI-Powered Compliance Intelligence</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 tracking-tight leading-[1.1]">
              Compliance Collections{' '}
              <span className="text-accent text-glow">AI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              AI-powered policies, procedures, and guidelines for hospitals
              and surgery centers. Institutional compliance — intelligently searchable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SearchBar
              onSearch={handleSearch}
              size="large"
              initialValue={searchQuery}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-10 text-muted-foreground text-sm"
          >
            {[
              { icon: Book, text: `${totalBooks} Compliance Titles` },
              { icon: Database, text: `${collections.length || 5} Curated Collections` },
              { icon: Activity, text: 'AI-Powered Analysis' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4 text-accent" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-12">
        {hasSearched ? (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">AI Search Results</h2>
                  <p className="text-muted-foreground">Searching for "{searchQuery}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <SearchBar onSearch={handleSearch} initialValue={searchQuery} className="hidden md:block w-80" />
                  <Button variant="outline" size="sm" onClick={() => { setHasSearched(false); setAiRecommendations([]); }}>
                    Clear
                  </Button>
                </div>
              </div>

              {/* AI Results — the only search results */}
              <AISearchResults 
                recommendations={aiRecommendations} 
                loading={aiSearchLoading} 
                query={searchQuery}
                onViewBook={handleViewBook}
                onViewChapter={handleViewChapter}
              />

              {!aiSearchLoading && aiRecommendations.length === 0 && (
                <div className="text-center py-16 glass-card rounded-xl">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                  <p className="text-muted-foreground mb-6">Try rephrasing your query or using different terms</p>
                  <Button onClick={() => { setHasSearched(false); }}>Back to Home</Button>
                </div>
              )}
            </div>
            <aside className="space-y-6">
              <TrendingTopics onTopicClick={handleSearch} />
            </aside>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Stats */}
            <AnimatedSection>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Book, label: 'Compliance Titles', value: String(totalBooks), sublabel: 'Curated Content', color: 'accent' },
                  { icon: Search, label: 'Searchable Chapters', value: `${totalChapters}+`, sublabel: 'Fully Indexed', color: 'accent' },
                  { icon: TrendingUp, label: 'Regulatory Frameworks', value: '5+', sublabel: 'JCAHO, CMS, OSHA & more', color: 'accent' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="glass-card stat-card p-6 rounded-xl text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mx-auto mb-4">
                      <stat.icon className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-4xl font-extrabold text-foreground font-mono">{stat.value}</p>
                    <p className="font-semibold text-foreground mt-1">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            {/* Regulatory Positioning */}
            <AnimatedSection>
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
                  Built for <span className="text-accent text-glow-subtle">Regulatory Compliance</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Every collection is mapped to major regulatory frameworks your institution must satisfy.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {regulatoryBadges.map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, borderColor: 'hsl(174 72% 46% / 0.4)' }}
                    className="flex items-center gap-3 px-5 py-3 rounded-lg glass-card glow-border cursor-default"
                  >
                    <Shield className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-bold text-foreground text-sm font-mono">{badge.label}</p>
                      <p className="text-xs text-muted-foreground">{badge.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            {/* Collections Overview — show real enterprise collections when logged in */}
            {isEnterpriseMode && collections.length > 0 && (
              <AnimatedSection>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
                      Your <span className="text-accent">Collections</span>
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      {collections.length} collection{collections.length !== 1 ? 's' : ''} with{' '}
                      {collections.reduce((sum, c) => sum + c.bookIds.length, 0)} titles
                    </p>
                  </div>
                  <motion.div whileHover={{ x: 4 }}>
                    <Button variant="outline" onClick={() => navigate('/collections')} className="border-accent/20 text-accent hover:bg-accent/10">
                      View All <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </motion.div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.slice(0, 6).map((col, i) => (
                    <motion.div
                      key={col.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                    >
                      <Card
                        className="glass-card glow-border cursor-pointer h-full"
                        onClick={() => navigate(`/collections/${col.id}`)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                              <FolderOpen className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground line-clamp-1">{col.name}</h3>
                              <p className="text-xs text-accent font-mono">{col.bookIds.length} titles</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{col.description}</p>
                          <Badge variant="secondary" className="text-xs bg-accent/5 text-accent border-accent/10">
                            {col.category.replace('_', ' ')}
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            )}

            {/* Institutional Value Proposition */}
            <AnimatedSection>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 leading-tight">
                    Reduce Compliance Risk.{' '}
                    <span className="text-accent text-glow-subtle">Pass Every Audit.</span>
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    MedLibPro provides your institution with AI-powered access to the most critical
                    compliance content — mapped to regulatory requirements.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      'AI-powered compliance point extraction',
                      'Chapter-scoped Q&A with citation tracking',
                      'Cross-title search across 50 titles',
                      'Institutional dashboards & usage reporting',
                      'Seat-based licensing with full data isolation',
                    ].map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 text-sm"
                      >
                        <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  {!isEnterpriseMode && !isPlatformAdmin && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="cta" 
                        size="lg" 
                        onClick={() => navigate('/subscribe')}
                        className="shadow-glow"
                      >
                        Request a Demo
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </motion.div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '95%', label: 'Audit Readiness', desc: 'Higher audit scores reported' },
                    { value: '60%', label: 'Faster Lookups', desc: 'AI-assisted compliance search' },
                    { value: '50', label: 'Titles', desc: 'Curated compliance content' },
                    { value: '24/7', label: 'Access', desc: 'Always-on institutional' },
                  ].map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 }}
                      whileHover={{ y: -4 }}
                      className="glass-card stat-card p-5 rounded-xl text-center"
                    >
                      <p className="text-3xl font-extrabold text-accent font-mono">{metric.value}</p>
                      <p className="font-semibold text-foreground text-sm mt-1">{metric.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{metric.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Request Demo CTA */}
            {!isEnterpriseMode && !isPlatformAdmin && (
              <AnimatedSection>
                <div className="relative rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-accent/5" />
                  <div className="absolute inset-0 grid-bg-subtle opacity-30" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  <div className="relative p-12 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                        Ready to Strengthen Your{' '}
                        <span className="text-accent text-glow-subtle">Compliance Program</span>?
                      </h2>
                      <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
                        Contact us for institutional pricing, a live demo, or to start a pilot program.
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="cta" size="lg" onClick={() => navigate('/subscribe')} className="shadow-glow">
                            Request Demo / Quote
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-accent/30 text-accent hover:bg-accent/10"
                            onClick={() => navigate('/collections')}
                          >
                            Browse Collections
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Trending Topics */}
            <AnimatedSection>
              <TrendingTopics onTopicClick={handleSearch} compact />
            </AnimatedSection>
          </div>
        )}
      </main>



    </div>
  );
}
