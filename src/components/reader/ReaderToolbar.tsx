import { 
  ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Share2, 
  Highlighter, MessageSquare, BarChart3, List, Type, 
  ZoomIn, ZoomOut, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReaderToolbarProps {
  bookTitle: string;
  chapterTitle: string;
  pageNumber: number;
  isBookmarked: boolean;
  fontSize: number;
  activePanel: string | null;
  onToggleBookmark: () => void;
  onShare: () => void;
  onFontSizeChange: (size: number) => void;
  onTogglePanel: (panel: string) => void;
  onPrevChapter: (() => void) | null;
  onNextChapter: (() => void) | null;
  onSearch: () => void;
}

export function ReaderToolbar({
  bookTitle,
  chapterTitle,
  pageNumber,
  isBookmarked,
  fontSize,
  activePanel,
  onToggleBookmark,
  onShare,
  onFontSizeChange,
  onTogglePanel,
  onPrevChapter,
  onNextChapter,
  onSearch,
}: ReaderToolbarProps) {
  return (
    <div className="border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-2 flex items-center justify-between gap-2 flex-shrink-0">
      {/* Left: Nav + Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex-shrink-0"
              disabled={!onPrevChapter}
              onClick={onPrevChapter ?? undefined}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous Chapter</TooltipContent>
        </Tooltip>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{bookTitle}</p>
          <p className="text-sm font-semibold truncate">{chapterTitle}</p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex-shrink-0"
              disabled={!onNextChapter}
              onClick={onNextChapter ?? undefined}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next Chapter</TooltipContent>
        </Tooltip>
        
        <Badge variant="secondary" className="flex-shrink-0 text-xs">
          Page {pageNumber}
        </Badge>
      </div>

      {/* Center: Tools */}
      <div className="hidden md:flex items-center gap-1 border-l border-r border-border/50 px-3 mx-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search in chapter</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={activePanel === 'highlights' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onTogglePanel('highlights')}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Highlights & Annotations</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onFontSizeChange(fontSize - 1)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Decrease font size</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onFontSizeChange(fontSize + 1)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Increase font size</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={activePanel === 'toc' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onTogglePanel('toc')}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Table of Contents</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={activePanel === 'ai' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onTogglePanel('ai')}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Assistant</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={activePanel === 'analytics' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onTogglePanel('analytics')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reading Analytics</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onToggleBookmark}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-warning" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isBookmarked ? 'Remove Bookmark' : 'Bookmark Chapter'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
