import { useCountdown } from '@/hooks/useCountdown';
import { formatCountdown } from '@/lib/utils';
import { Timer } from 'lucide-react';

interface Props {
  deadline: number;
  label: string;
  onExpiry?: () => void;
}

export function ChallengeTimer({ deadline, label, onExpiry }: Props) {
  const { remaining, expired } = useCountdown(deadline);

  if (expired && onExpiry) {
    // Trigger on next tick to avoid state-during-render
    setTimeout(onExpiry, 0);
  }

  return (
    <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2">
      <Timer className={`w-4 h-4 ${expired ? 'text-muted-foreground' : 'text-warning'}`} />
      <div className="flex-1">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-mono font-bold ${expired ? 'text-muted-foreground' : 'text-foreground'}`}>
          {expired ? 'Expired' : formatCountdown(remaining)}
        </p>
      </div>
    </div>
  );
}
