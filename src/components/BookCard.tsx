import React from 'react';
import { Book, Users, Search, Check, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EpubBook } from '@/data/mockEpubData';
import { useUser } from '@/context/UserContext';
import { useEnterprise } from '@/context/EnterpriseContext';
import { getBookCover } from '@/assets/covers';

interface BookCardProps {
  book: EpubBook;
  onView: (book: EpubBook) => void;
}

export const BookCard = React.forwardRef<HTMLDivElement, BookCardProps>(
  function BookCard({ book, onView }, ref) {
    const { hasFullAccess } = useUser();
    const { isEnterpriseMode, currentEnterprise } = useEnterprise();
    // Enterprise users with an enterprise account get full access to all books
    const hasAccess = hasFullAccess(book.id) || isEnterpriseMode;
    const coverImage = getBookCover(book.id);

    return (
      <Card ref={ref} className="card-elevated overflow-hidden group h-full flex flex-col">
        {/* Cover Header */}
        <div 
          className="h-40 relative overflow-hidden"
          style={{ background: !coverImage ? `linear-gradient(135deg, ${book.coverColor} 0%, ${book.coverColor}dd 100%)` : undefined }}
        >
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Book className="h-16 w-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 right-3 flex gap-1.5">
            {hasAccess && (
              <Badge className="bg-success text-success-foreground">
                <Check className="h-3 w-3 mr-1" />
                Institutional Access
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
        </div>
        
        <CardContent className="flex-1 p-4 pt-2">
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs mb-2">
              {book.specialty}
            </Badge>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
              {book.title}
            </h3>
            {book.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{book.subtitle}</p>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {book.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {book.accessCount.toLocaleString()} readers
            </span>
            <span className="flex items-center gap-1">
              <Search className="h-3.5 w-3.5" />
              {book.searchCount.toLocaleString()} searches
            </span>
          </div>
          
          <div className="mt-3 text-xs text-muted-foreground">
            <p className="truncate">{book.authors.slice(0, 2).join(', ')}{book.authors.length > 2 ? ' et al.' : ''}</p>
            <p>{book.publisher} • {book.publishedYear}</p>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 mt-auto">
          {hasAccess ? (
            <Button 
              onClick={() => onView(book)} 
              className="w-full"
            >
              <Book className="h-4 w-4 mr-1.5" />
              Open Book
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              <Building2 className="h-4 w-4 mr-1.5" />
              Institutional Access Required
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
);
