import { formatUSDC } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

export function BountyBadge({ amount }: { amount: number }) {
  return (
    <div className="inline-flex items-center gap-1 bg-warning/10 text-warning border border-warning/30 px-2 py-0.5 rounded-full text-xs font-mono font-semibold">
      <DollarSign className="w-3 h-3" />
      {formatUSDC(amount)} USDC
    </div>
  );
}
