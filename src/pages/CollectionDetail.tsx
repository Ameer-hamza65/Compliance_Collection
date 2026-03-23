import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePermission } from '@/hooks/usePermission';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEnterprise } from '@/context/EnterpriseContext';
import { useBooks } from '@/context/BookContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, ArrowLeft, BookOpen, Lock, ShieldCheck,
  Users, Eye, Search, Scissors, Syringe, Stethoscope, Heart, Wind, Crown
} from 'lucide-react';
import { TierBadge } from '@/components/TierBadge';
import { AddOnBuilder } from '@/components/AddOnBuilder';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors, Syringe, ShieldCheck, Stethoscope, Heart, Wind
};

const categoryColors: Record<string, string> = {
  perioperative: 'bg-accent/10 text-accent border-accent/20',
  anesthesia: 'bg-primary/10 text-primary border-primary/20',
  patient_safety: 'bg-success/10 text-success border-success/20',
  surgical: 'bg-destructive/10 text-destructive border-destructive/20',
  general: 'bg-muted text-muted-foreground border-border'
};

export default function CollectionDetail() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { currentEnterprise, isEnterpriseMode, collections, getEnterpriseBookAccess, logAction, canAccessCollectionByTier, currentTier, currentUser } = useEnterprise();
  const { books } = useBooks();
  const canRequestAddon = usePermission('addon.request');
  const collection = collections.find(c => c.id === collectionId);

  // Log collection_view event (fire-and-forget)
  useEffect(() => {
    if (!collection || !isEnterpriseMode || !currentEnterprise) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id || null;
      supabase.from('usage_events').insert([{
        event_type: 'collection_view',
        user_id: userId,
        enterprise_id: currentEnterprise?.id || null,
        metadata: { collection_id: collection.id, collection_name: collection.name },
      }]).then(() => {});
    });
  }, [collection?.id, isEnterpriseMode, currentEnterprise?.id]);

  if (!isEnterpriseMode || !currentEnterprise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full glass-card">
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Enterprise Access Required</CardTitle>
              <CardDescription>Please log in with an enterprise account to view collections.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/')}>Return Home</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  
  if (!collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-card">
          <CardHeader className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Collection Not Found</CardTitle>
            <CardDescription>The requested collection does not exist.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/collections')}>Back to Collections</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isTierLocked = !canAccessCollectionByTier(collection.id);

  if (isTierLocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full glass-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-warning/10">
                <Crown className="h-12 w-12 text-warning" />
              </div>
              <CardTitle>Upgrade Required</CardTitle>
              <CardDescription>
                <span className="font-semibold">{collection.name}</span> requires a Pro or Enterprise plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              {currentTier && <TierBadge tier={currentTier.id} size="lg" />}
              <p className="text-sm text-muted-foreground text-center">Your current plan includes access to 2 collections. Upgrade to unlock all 5 compliance collections.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/collections')}>Back</Button>
                <Button onClick={() => toast.info('Contact your administrator to upgrade your plan')}>Contact Admin</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }


  const isEnterpriseTier = currentTier?.id === 'enterprise';
  const isProTier = currentTier?.id === 'pro';
  const bookAccessList = getEnterpriseBookAccess(currentEnterprise.id);
  const accessibleBookIds = new Set(bookAccessList.filter(ba => ba.accessLevel === 'full').map(ba => ba.bookId));

  const hasBookAccessForTier = (bookId: string) => {
    if (isEnterpriseTier || isProTier) return true;
    return accessibleBookIds.has(bookId);
  };

  const collectionBooks = collection.bookIds.map(id => books.find(b => b.id === id)).filter(Boolean);
  const IconComponent = iconMap[collection.icon] || BookOpen;

  const handleBookClick = (bookId: string, bookTitle: string, hasAccess: boolean) => {
    if (hasAccess) {
      logAction('view_book', 'book', bookId, bookTitle);
      navigate(`/reader?book=${bookId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="medical-gradient">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground mb-4" onClick={() => navigate('/collections')}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Collections
            </Button>
          </motion.div>
          <motion.div className="flex items-start gap-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="p-4 rounded-xl bg-accent/10 glow-border">
              <IconComponent className="h-8 w-8 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{collection.name}</h1>
                <Badge className={categoryColors[collection.category] || categoryColors.general}>{collection.category.replace('_', ' ')}</Badge>
                {currentTier && <TierBadge tier={currentTier.id} size="sm" />}
              </div>
              <p className="text-muted-foreground max-w-2xl">{collection.description}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, value: collectionBooks.length, label: 'Total Titles', color: 'text-accent' },
            { icon: ShieldCheck, value: collectionBooks.filter(b => hasBookAccessForTier(b!.id)).length, label: 'Accessible', color: 'text-success' },
            { icon: Users, value: currentEnterprise.usedSeats, label: 'Users with Access', color: 'text-primary' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}>
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Books in this Collection</CardTitle>
              <CardDescription>Click on a book to view its contents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectionBooks.map((book, index) => {
                  if (!book) return null;
                  const hasAccess = hasBookAccessForTier(book.id);
                  return (
                    <motion.div 
                      key={book.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${hasAccess ? 'hover:bg-accent/5 cursor-pointer border-border' : 'bg-muted/30 border-border/50'}`}
                      onClick={() => handleBookClick(book.id, book.title, hasAccess)}
                    >
                      <div className="w-16 h-20 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0" style={{ backgroundColor: book.coverColor }}>
                        {book.title.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold truncate ${!hasAccess ? 'text-muted-foreground' : ''}`}>{book.title}</h3>
                          {!hasAccess && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{book.authors.join(', ')}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{book.accessCount.toLocaleString()} views</span>
                          <span className="flex items-center gap-1"><Search className="h-3 w-3" />{book.searchCount.toLocaleString()} searches</span>
                          <Badge variant="secondary" className="text-xs">{book.tableOfContents.length} chapters</Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {hasAccess ? (
                          <Badge className="bg-success/10 text-success border-success/20">Full Access</Badge>
                        ) : (
                          <Badge variant="secondary">No Access</Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {canRequestAddon && currentUser?.role === 'admin' && <AddOnBuilder collectionId={collection.id} collectionBookIds={collection.bookIds} />}

        {collectionBooks.some(b => b && !hasBookAccessForTier(b.id)) && (
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Card className="mt-6 border-warning/30 bg-warning/5 glass-card">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-warning" />
                    <div>
                      <h3 className="font-semibold">Some titles are locked</h3>
                      <p className="text-sm text-muted-foreground">Contact your administrator to request access to additional books.</p>
                    </div>
                  </div>
                  <Button variant="outline">Request Access</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
