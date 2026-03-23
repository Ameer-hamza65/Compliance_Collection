import { useState, useCallback } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
  initialValue?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search medical topics, conditions, drugs, procedures...",
  className,
  size = 'default',
  initialValue = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const suggestedSearches = [
    'diabetes management',
    'heart failure treatment',
    'anticoagulation therapy',
    'sepsis protocols',
  ];

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "relative flex items-center rounded-xl border bg-card transition-all duration-200",
          isFocused ? "border-accent shadow-lg ring-2 ring-accent/20" : "border-border shadow-card hover:shadow-card-hover",
          size === 'large' ? "h-16" : "h-12"
        )}>
          <Search className={cn(
            "absolute left-4 text-muted-foreground transition-colors",
            isFocused && "text-accent",
            size === 'large' ? "h-6 w-6" : "h-5 w-5"
          )} />
          
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              "h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
              size === 'large' ? "pl-14 pr-32 text-lg" : "pl-12 pr-28 text-base"
            )}
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-24 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <Button 
            type="submit" 
            variant="cta"
            size={size === 'large' ? 'lg' : 'default'}
            className={cn(
              "absolute right-2",
              size === 'large' ? "px-6" : "px-4"
            )}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Search
          </Button>
        </div>
      </form>
      
      {size === 'large' && (
        <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
          <span className="text-sm text-muted-foreground">Try:</span>
          {suggestedSearches.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion);
              }}
              className="text-sm px-3 py-1 rounded-full bg-secondary hover:bg-accent/10 hover:text-accent text-secondary-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
