import React from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useEnterprise } from '@/context/EnterpriseContext';
import { useBooks } from '@/context/BookContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Scissors, Syringe, ShieldCheck, Stethoscope,
  Heart, Wind, BookOpen, ArrowRight, Lock, Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TierBadge } from '@/components/TierBadge';

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

export default function ComplianceCollections() {
  const navigate = useNavigate();
  const { currentEnterprise, isEnterpriseMode, collections, getEnterpriseBookAccess, logAction, canAccessCollectionByTier, currentTier } = useEnterprise();
  const { books } = useBooks();

  if (!isEnterpriseMode || !currentEnterprise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <Card className="max-w-md w-full glass-card">
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Enterprise Access Required</CardTitle>
              <CardDescription>Compliance collections are available to enterprise users only.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/')}>Return Home</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const bookAccessList = getEnterpriseBookAccess(currentEnterprise.id);
  const accessibleBookIds = new Set(bookAccessList.filter(ba => ba.accessLevel === 'full').map(ba => ba.bookId));

  const handleCollectionClick = (collection: typeof collections[0]) => {
    if (!canAccessCollectionByTier(collection.id)) return;
    logAction('access_collection', 'collection', collection.id, collection.name);
    navigate(`/collections/${collection.id}`);
  };

  const getCollectionAccessStatus = (collection: typeof collections[0]) => {
    const accessibleCount = collection.bookIds.filter(id => accessibleBookIds.has(id)).length;
    return { accessible: accessibleCount, total: collection.bookIds.length, hasFullAccess: accessibleCount === collection.bookIds.length };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="medical-gradient">
        <div className="container mx-auto px-4 py-8">
          <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">Compliance Collections</h1>
                {currentTier && <TierBadge tier={currentTier.id} size="md" />}
              </div>
              <p className="text-muted-foreground">Curated clinical content bundles for {currentEnterprise.name}</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/enterprise')}>Back to Dashboard</Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="mb-8 border-accent/30 bg-accent/5 glass-card">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-8 w-8 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Compliance-Focused Content Bundles</h3>
                  <p className="text-sm text-muted-foreground">
                    These curated collections are designed to support regulatory compliance, risk reduction, and standardized clinical practice.
                    {currentTier && currentTier.collectionsAccess === 'limited' && (
                      <span className="block mt-1 text-warning">
                        Your {currentTier.name} plan includes access to {currentTier.maxCollections} collections. Upgrade to Pro for full access.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => {
            const IconComponent = iconMap[collection.icon] || BookOpen;
            const accessStatus = getCollectionAccessStatus(collection);
            const collectionBooks = collection.bookIds.map(id => books.find(b => b.id === id)).filter(Boolean);
            const isTierLocked = !canAccessCollectionByTier(collection.id);

            return (
              <motion.div key={collection.id} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card 
                  className={`group transition-shadow h-full glass-card ${isTierLocked ? 'opacity-70 border-dashed cursor-default' : 'hover:shadow-lg cursor-pointer'}`}
                  onClick={() => handleCollectionClick(collection)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${isTierLocked ? 'bg-muted' : 'bg-accent/10'}`}>
                        {isTierLocked ? <Lock className="h-6 w-6 text-muted-foreground" /> : <IconComponent className="h-6 w-6 text-accent" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {isTierLocked && (
                          <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">
                            <Crown className="h-2.5 w-2.5 mr-1" />Pro Required
                          </Badge>
                        )}
                        <Badge className={categoryColors[collection.category] || categoryColors.general}>
                          {collection.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className={`text-lg mt-4 ${isTierLocked ? 'text-muted-foreground' : ''}`}>{collection.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{collection.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isTierLocked ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">This collection requires a Pro or Enterprise plan.</p>
                        <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); toast.info('Contact your administrator to upgrade your plan'); }}>Contact Admin to Upgrade</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {collectionBooks.slice(0, 3).map((book) => {
                            const hasAccess = accessibleBookIds.has(book!.id);
                            return (
                              <div key={book!.id} className="flex items-center gap-2 text-sm">
                                {hasAccess ? <BookOpen className="h-4 w-4 text-success" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                                <span className={hasAccess ? '' : 'text-muted-foreground'}>{book!.title}</span>
                              </div>
                            );
                          })}
                          {collectionBooks.length > 3 && <p className="text-xs text-muted-foreground pl-6">+{collectionBooks.length - 3} more titles</p>}
                        </div>
                        <div className="pt-4 border-t flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium text-success">{accessStatus.accessible}</span>
                            <span className="text-muted-foreground">/{accessStatus.total} titles accessible</span>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-1 group-hover:translate-x-1 transition-transform">View <ArrowRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <Card className="mt-8 glass-card">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Need access to additional collections?</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentTier && currentTier.collectionsAccess === 'limited'
                      ? 'Upgrade your plan to unlock all 5 compliance collections.'
                      : "Contact your institution's administrator to expand your content license."}
                  </p>
                </div>
                <Button variant="outline" onClick={() => toast.info('Contact your administrator to expand your content license')}>
                  {currentTier && currentTier.collectionsAccess === 'limited' ? 'Contact Admin for Upgrade' : 'Request Additional Access'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
