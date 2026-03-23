import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEnterprise } from '@/context/EnterpriseContext';
import { useBooks } from '@/context/BookContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddOnBuilderProps {
  collectionId: string;
  collectionBookIds: string[];
}

const MAX_TITLES_PER_COLLECTION = 10;

export function AddOnBuilder({ collectionId, collectionBookIds }: AddOnBuilderProps) {
  const { currentEnterprise, currentUser, currentTier, logAction, refreshCollections } = useEnterprise();
  const { books } = useBooks();
  const { toast } = useToast();
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Only enterprise admins can use AddOnBuilder
  const isAdmin = currentUser?.role === 'admin';
  const isUnlimitedTier = currentTier?.id === 'enterprise' || currentTier?.id === 'pro';

  // Calculate remaining slots for this collection
  const currentTitleCount = collectionBookIds.length;
  const remainingSlots = isUnlimitedTier 
    ? Infinity 
    : Math.max(0, MAX_TITLES_PER_COLLECTION - currentTitleCount);
  const atLimit = !isUnlimitedTier && remainingSlots === 0;

  // Get books NOT already in this collection
  const availableTitles = books.filter(b => !collectionBookIds.includes(b.id));

  if (!isAdmin) return null;

  const toggleTitle = (bookId: string) => {
    setSelectedTitles(prev => {
      if (prev.includes(bookId)) return prev.filter(id => id !== bookId);
      // Enforce limit for basic tier
      if (!isUnlimitedTier && prev.length >= remainingSlots) {
        toast({
          title: 'Title Limit Reached',
          description: `Basic plan allows a maximum of ${MAX_TITLES_PER_COLLECTION} titles per collection. You can select ${remainingSlots} more.`,
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, bookId];
    });
  };

  const handleAddTitles = async () => {
    if (selectedTitles.length === 0) return;

    // Final limit check
    if (!isUnlimitedTier && currentTitleCount + selectedTitles.length > MAX_TITLES_PER_COLLECTION) {
      toast({
        title: 'Title Limit Exceeded',
        description: `Basic plan allows max ${MAX_TITLES_PER_COLLECTION} titles per collection. You have ${currentTitleCount} already.`,
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);

    try {
      const selectedBooks = availableTitles.filter(b => selectedTitles.includes(b.id));

      const rows = selectedTitles.map(bookId => ({
        collection_id: collectionId,
        book_id: bookId,
      }));

      const { error } = await supabase
        .from('collection_books')
        .insert(rows);

      if (error) throw error;

      // Audit log
      await supabase.from('audit_logs').insert({
        action: 'addon_titles_added',
        target_type: 'collection',
        target_id: collectionId,
        target_title: `Added ${selectedTitles.length} titles`,
        user_id: (await supabase.auth.getUser()).data.user?.id || null,
        enterprise_id: currentEnterprise?.id || null,
        metadata: {
          titles: selectedBooks.map(b => ({ id: b.id, title: b.title })),
          count: selectedTitles.length,
        },
      });

      logAction(
        'addon_titles_added',
        'collection',
        collectionId,
        `Added ${selectedTitles.length} titles`,
        {
          titles: selectedBooks.map(b => ({ id: b.id, title: b.title })),
          count: selectedTitles.length,
          enterpriseId: currentEnterprise?.id,
        }
      );

      await refreshCollections();

      toast({
        title: 'Titles Added',
        description: `${selectedTitles.length} title(s) have been added to this collection.`,
      });

      setSelectedTitles([]);
    } catch (err: any) {
      toast({
        title: 'Error Adding Titles',
        description: err.message || 'Failed to add titles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mt-6 glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg">Add Titles to Collection</CardTitle>
          </div>
          <CardDescription>
            Select titles to add directly to this collection.
            {!isUnlimitedTier && (
              <span className="ml-1 font-medium">
                ({currentTitleCount}/{MAX_TITLES_PER_COLLECTION} titles used — {remainingSlots} remaining)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {atLimit ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Title limit reached</p>
                <p className="text-xs text-muted-foreground">
                  Basic plan allows a maximum of {MAX_TITLES_PER_COLLECTION} titles per collection. Upgrade to Pro or Enterprise for unlimited titles.
                </p>
              </div>
            </div>
          ) : availableTitles.length === 0 ? (
            <p className="text-sm text-muted-foreground">All available titles are already in this collection.</p>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {availableTitles.map(book => (
                  <label
                    key={book.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedTitles.includes(book.id)}
                      onCheckedChange={() => toggleTitle(book.id)}
                    />
                    <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{book.authors.join(', ')}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedTitles.length} title(s) selected
                  {!isUnlimitedTier && ` of ${remainingSlots} available`}
                </p>
                <Button
                  onClick={handleAddTitles}
                  disabled={selectedTitles.length === 0 || isAdding}
                >
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Titles to Collection
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
