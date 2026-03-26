import { EpubBook } from '@/data/mockEpubData';
import { Badge } from '@/components/ui/badge';
import { Book, Calendar, Building2, Hash, Layers, Globe } from 'lucide-react';

interface BookInfoPageProps {
  book: EpubBook;
}

export function BookInfoPage({ book }: BookInfoPageProps) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Cover + Title Section */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Cover Image */}
        <div className="flex-shrink-0 flex justify-center sm:justify-start">
          {(book as any).coverUrl ? (
            <img
              src={(book as any).coverUrl}
              alt={book.title}
              className="w-48 h-auto rounded-lg shadow-lg border border-border/50"
            />
          ) : (
            <div
              className="w-48 h-64 rounded-lg shadow-lg flex items-center justify-center"
              style={{ backgroundColor: book.coverColor }}
            >
              <Book className="h-16 w-16 text-white/30" />
            </div>
          )}
        </div>

        {/* Title & Authors */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="text-base text-muted-foreground mb-4">{book.subtitle}</p>
          )}
          <div className="space-y-2 text-sm">
            <p className="text-foreground">
              <span className="font-semibold">
                {book.authors.length > 1 ? 'Authors' : 'Author'}:
              </span>{' '}
              {book.authors.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <MetadataItem icon={Building2} label="Publisher" value={book.publisher} />
        <MetadataItem icon={Hash} label="ISBN" value={book.isbn} />
        <MetadataItem icon={Layers} label="Edition" value={book.edition || '1st Edition'} />
        <MetadataItem icon={Calendar} label="Published" value={String(book.publishedYear)} />
        <MetadataItem icon={Globe} label="Specialty" value={book.specialty} />
        <MetadataItem
          icon={Book}
          label="Chapters"
          value={`${book.tableOfContents.filter(c => !c.category || c.category === 'chapter').length} chapters`}
        />
      </div>

      {/* Description */}
      {book.description && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
        </div>
      )}

      {/* Tags */}
      {book.tags && book.tags.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {book.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetadataItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
