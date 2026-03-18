import { useState } from 'react';
import type { Category } from '@/types/intelligence';
import { useIntelligence } from '@/context/IntelligenceContext';
import { FilterBar } from '@/components/layout/FilterBar';
import { IntelligenceGrid } from '@/components/intelligence/IntelligenceGrid';
import { CreateRequestModal } from '@/components/intelligence/CreateRequestModal';

export function HomePage() {
  const { getFiltered } = useIntelligence();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [paidOnly, setPaidOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = getFiltered({ search, category: activeCategory, paidOnly });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="text-center space-y-2 pb-4">
        <h2 className="text-2xl font-bold text-foreground">Intelligence Feed</h2>
        <p className="text-sm text-muted-foreground font-mono max-w-xl mx-auto">
          Anonymous intelligence marketplace powered by info-finance. Post questions, claim bounties, verify truth.
        </p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        paidOnly={paidOnly}
        onPaidOnlyChange={setPaidOnly}
        onCreateClick={() => setShowCreate(true)}
      />

      <IntelligenceGrid requests={filtered} />

      <CreateRequestModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
