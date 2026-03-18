import type { RequestStatus } from '@/types/intelligence';
import { cn } from '@/lib/utils';

const statusConfig: Record<RequestStatus, { color: string; label: string }> = {
  open: { color: 'bg-info', label: 'Open' },
  proposed: { color: 'bg-warning', label: 'Proposed' },
  disputed: { color: 'bg-destructive', label: 'Disputed' },
  resolved: { color: 'bg-success', label: 'Resolved' },
  settled: { color: 'bg-muted-foreground', label: 'Settled' },
};

export function StatusIndicator({ status }: { status: RequestStatus }) {
  const { color, label } = statusConfig[status];
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
