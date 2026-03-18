import type { EscrowStatus } from '@/types/escrow';
import { cn } from '@/lib/utils';

const steps: { key: EscrowStatus; label: string }[] = [
  { key: 'locked', label: 'Locked' },
  { key: 'pending_release', label: 'Pending' },
  { key: 'released', label: 'Released' },
];

const statusOrder: Record<EscrowStatus, number> = {
  locked: 0,
  pending_release: 1,
  disputed: 1,
  released: 2,
  refunded: 2,
};

export function EscrowStatusBar({ status }: { status: EscrowStatus }) {
  const currentStep = statusOrder[status];
  const isDisputed = status === 'disputed';
  const isRefunded = status === 'refunded';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          const showDisputed = isActive && isDisputed;
          const showRefunded = isActive && isRefunded;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-2 w-full rounded-full transition-colors',
                  isCompleted ? 'bg-success' :
                  showDisputed ? 'bg-destructive' :
                  showRefunded ? 'bg-muted-foreground' :
                  isActive ? 'bg-warning' :
                  'bg-border'
                )}
              />
              <span className={cn(
                'text-[10px] font-mono',
                isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
              )}>
                {showDisputed ? 'Disputed' : showRefunded ? 'Refunded' : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
