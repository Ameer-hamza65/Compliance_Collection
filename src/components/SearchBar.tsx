import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  publisher?: string;
  specialty?: string;
  edition?: string;
}

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
  initialValue?: string;
  showFilters?: boolean;
}

const SUGGESTED_PROMPTS = [
  { category: 'Compliance', prompts: ['infection control policies', 'OSHA workplace safety requirements', 'medication administration guidelines'] },
  { category: 'Nursing', prompts: ['nursing care protocols', 'patient assessment standards', 'wound care management'] },
  { category: 'Surgery', prompts: ['perioperative safety checklist', 'surgical site infection prevention', 'sterilization procedures'] },
  { category: 'General', prompts: ['diabetes management', 'heart failure treatment protocols', 'sepsis early detection'] },
];

const FILTER_OPTIONS = {
  publisher: ['Rittenhouse', 'Elsevier', 'Springer', 'Wiley', 'McGraw-Hill'],
  specialty: ['Internal Medicine', 'Surgery', 'Nursing', 'Pharmacy', 'Emergency Medicine', 'Infection Control', 'Compliance'],
  edition: ['Latest Edition', '2024', '2023', '2022'],
};

export function SearchBar({ 
  onSearch, 
  placeholder = "Ask anything: policies, procedures, drug interactions, compliance topics...",
  className,
  size = 'default',
  initialValue = '',
  showFilters = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [activeCategory, setActiveCategory] = useState<string>('Compliance');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setShowFilterPanel(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), activeFilters);
      setShowSuggestions(false);
    }
  }, [query, onSearch, activeFilters]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion, activeFilters);
    setShowSuggestions(false);
  }, [onSearch, activeFilters]);

  const handleClear = useCallback(() => {
    setQuery('');
    setActiveFilters({});
  }, []);

  const toggleFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  const currentPrompts = SUGGESTED_PROMPTS.find(c => c.category === activeCategory)?.prompts || [];

  // Quick suggestions shown below large search bar
  const quickSuggestions = [
    'infection control policies',
    'OSHA compliance requirements',
    'medication safety protocols',
    'surgical site prevention',
  ];

  return (
    <div className={cn("w-full relative", className)} ref={wrapperRef}>
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
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length === 0 && size === 'large') {
                setShowSuggestions(true);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              if (size === 'large' && !query) setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              "h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
              size === 'large' ? "pl-14 pr-36 text-lg" : "pl-12 pr-28 text-base"
            )}
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {(showFilters || size === 'large') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 gap-1 text-xs",
                  activeFilterCount > 0 && "text-accent"
                )}
                onClick={() => {
                  setShowFilterPanel(prev => !prev);
                  setShowSuggestions(false);
                }}
              >
                <Filter className="h-3.5 w-3.5" />
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}

            <Button 
              type="submit" 
              variant="cta"
              size={size === 'large' ? 'lg' : 'default'}
              className={size === 'large' ? "px-6" : "px-4"}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {Object.entries(activeFilters).map(([key, value]) =>
            value ? (
              <Badge
                key={key}
                variant="secondary"
                className="text-xs gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => toggleFilter(key as keyof SearchFilters, value)}
              >
                {key}: {value}
                <X className="h-3 w-3" />
              </Badge>
            ) : null
          )}
          <button
            onClick={() => setActiveFilters({})}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Auto-suggest dropdown */}
      {showSuggestions && size === 'large' && (
        <div className="absolute z-50 w-full mt-2 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-3 border-b border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Browse by category</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    activeCategory === cat.category
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent/10 hover:text-accent"
                  )}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2">
            {currentPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSuggestionClick(prompt)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/5 text-left transition-colors group"
              >
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                <span className="text-sm text-foreground group-hover:text-accent transition-colors">{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter panel dropdown */}
      {showFilterPanel && (
        <div className="absolute z-50 w-full mt-2 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-4 space-y-4">
            {(Object.entries(FILTER_OPTIONS) as [keyof SearchFilters, string[]][]).map(([key, options]) => (
              <div key={key}>
                <p className="text-xs font-medium text-muted-foreground mb-2 capitalize">{key}</p>
                <div className="flex flex-wrap gap-1.5">
                  {options.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleFilter(key, option)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                        activeFilters[key] === option
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-secondary/50 text-secondary-foreground border-border hover:border-accent/30 hover:text-accent"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border/50 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveFilters({})}>
              Reset
            </Button>
            <Button size="sm" onClick={() => {
              setShowFilterPanel(false);
              if (query.trim()) onSearch(query.trim(), activeFilters);
            }}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
      
      {/* Quick suggestions for large search bar (when not showing dropdown) */}
      {size === 'large' && !showSuggestions && (
        <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
          <span className="text-sm text-muted-foreground">Try:</span>
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion, activeFilters);
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
