import type { EscrowState } from '@/types/escrow';
import { formatUSDC, formatTimestamp } from '@/lib/utils';
import { EscrowStatusBar } from './EscrowStatusBar';
import { Lock, Unlock, ArrowDownRight } from 'lucide-react';

export function EscrowDetails({ escrow }: { escrow: EscrowState }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {escrow.status === 'released' || escrow.status === 'refunded' ? (
            <Unlock className="w-4 h-4 text-success" />
          ) : (
            <Lock className="w-4 h-4 text-warning" />
          )}
          Escrow
        </h3>
        <span className="text-sm font-mono font-bold text-warning">
          {formatUSDC(escrow.amount)} USDC
        </span>
      </div>

      <EscrowStatusBar status={escrow.status} />

      {/* Transaction Log */}
      {escrow.transactionLog.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Transaction Log</p>
          {escrow.transactionLog.map(tx => (
            <div key={tx.id} className="flex items-start gap-2 text-xs">
              <ArrowDownRight className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-foreground">{tx.details}</span>
                <span className="text-muted-foreground ml-2">{formatTimestamp(tx.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
