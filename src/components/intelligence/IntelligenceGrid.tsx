import type { IntelligenceRequest } from '@/types/intelligence';
import { IntelligenceCard } from './IntelligenceCard';
import { Search } from 'lucide-react';

export function IntelligenceGrid({ requests }: { requests: IntelligenceRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Search className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">No intelligence requests match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map(req => (
        <IntelligenceCard key={req.id} request={req} />
      ))}
    </div>
  );
}
