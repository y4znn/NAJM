import { useState } from 'react';
import { CATEGORIES, type Category } from '@/types/intelligence';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  activeCategory: Category | null;
  onCategoryChange: (c: Category | null) => void;
  paidOnly: boolean;
  onPaidOnlyChange: (v: boolean) => void;
  onCreateClick: () => void;
}

export function FilterBar({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  paidOnly,
  onPaidOnlyChange,
  onCreateClick,
}: FilterBarProps) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search intelligence requests..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"
          />
        </div>

        <button
          onClick={() => setShowCategories(!showCategories)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors',
            showCategories
              ? 'bg-primary/10 border-primary/50 text-primary'
              : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>

        <button
          onClick={() => onPaidOnlyChange(!paidOnly)}
          className={cn(
            'px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
            paidOnly
              ? 'bg-warning/10 border-warning/50 text-warning'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          )}
        >
          Bounty Only
        </button>

        <button
          onClick={onCreateClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + New Request
        </button>
      </div>

      {showCategories && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              !activeCategory
                ? 'bg-primary/10 border-primary/50 text-primary'
                : 'bg-card border-border text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(activeCategory === cat ? null : cat)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                activeCategory === cat
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
