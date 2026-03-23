import { Book, FileText, ChevronRight, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EpubBook, Chapter, medicalTags } from '@/data/mockEpubData';
import { useUser } from '@/context/UserContext';
import { useEnterprise } from '@/context/EnterpriseContext';

interface SearchResultProps {
  book: EpubBook;
  chapter: Chapter;
  snippet: string;
  relevanceScore: number;
  searchQuery: string;
  onViewChapter: (book: EpubBook, chapter: Chapter) => void;
}

export function SearchResult({
  book,
  chapter,
  snippet,
  relevanceScore,
  searchQuery,
  onViewChapter,
}: SearchResultProps) {
  const { hasFullAccess } = useUser();
  const { isEnterpriseMode } = useEnterprise();
  const hasAccess = hasFullAccess(book.id);

  const highlightSnippet = (text: string, query: string) => {
    const terms = query.toLowerCase().split(/\s+/);
    let result = text;
    terms.forEach(term => {
      if (term.length > 2) {
        const regex = new RegExp(`(${term})`, 'gi');
        result = result.replace(regex, '<mark class="search-result-highlight">$1</mark>');
      }
    });
    return result;
  };

  const getTagLabel = (tagId: string) => {
    const tag = medicalTags.find(t => t.id === tagId);
    return tag?.name || tagId;
  };

  return (
    <Card className="card-elevated overflow-hidden animate-slide-up group">
      <CardContent className="p-0">
        <div className="flex">
          <div 
            className="hidden sm:flex w-2 flex-shrink-0"
            style={{ backgroundColor: book.coverColor }}
          />
          
          <div className="flex-1 p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Book className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground truncate">
                    {book.title}
                  </span>
                  {hasAccess && (
                    <span className="owned-badge flex-shrink-0">
                      <Check className="h-3 w-3 mr-1" />
                      Institutional Access
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                  {chapter.title}
                </h3>
              </div>
              
              <Badge variant="secondary" className="flex-shrink-0 text-xs">
                Page {chapter.pageNumber}
              </Badge>
            </div>
            
            {/* Snippet */}
            <div className="mb-4">
              <p 
                className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightSnippet(snippet, searchQuery) }}
              />
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {chapter.tags.slice(0, 4).map(tagId => (
                <span key={tagId} className="medical-tag">
                  {getTagLabel(tagId)}
                </span>
              ))}
              {chapter.tags.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{chapter.tags.length - 4} more
                </span>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
              {hasAccess ? (
                <Button
                  onClick={() => onViewChapter(book, chapter)}
                  className="flex-1 sm:flex-none"
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  Read Full Chapter
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="flex-1 sm:flex-none"
                >
                  <Building2 className="h-4 w-4 mr-1.5" />
                  Institutional Access Required
                </Button>
              )}
              
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">{book.specialty}</span>
                <span>•</span>
                <span>{book.publishedYear}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
