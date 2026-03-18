import type { Resolution } from '@/types/resolution';
import { formatTimestamp } from '@/lib/utils';
import { Circle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function ResolutionTimeline({ resolution }: { resolution: Resolution }) {
  const events: { time: number; icon: React.ReactNode; text: string }[] = [];

  for (const p of resolution.proposals) {
    events.push({
      time: p.createdAt,
      icon: <Circle className="w-3 h-3 text-primary" />,
      text: `${p.proposerAlias} proposed an answer`,
    });

    if (p.status === 'accepted') {
      events.push({
        time: p.challengeDeadline,
        icon: <CheckCircle className="w-3 h-3 text-success" />,
        text: 'Proposal accepted',
      });
    } else if (p.status === 'rejected') {
      events.push({
        time: p.challengeDeadline,
        icon: <XCircle className="w-3 h-3 text-destructive" />,
        text: 'Proposal rejected',
      });
    }
  }

  for (const d of resolution.disputes) {
    events.push({
      time: d.createdAt,
      icon: <AlertCircle className="w-3 h-3 text-destructive" />,
      text: `${d.challengerAlias} filed a dispute`,
    });

    if (d.outcome !== 'pending') {
      events.push({
        time: d.voteDeadline,
        icon: d.outcome === 'upheld'
          ? <XCircle className="w-3 h-3 text-destructive" />
          : <CheckCircle className="w-3 h-3 text-success" />,
        text: d.outcome === 'upheld' ? 'Dispute upheld — proposal rejected' : 'Dispute overturned — proposal accepted',
      });
    }
  }

  events.sort((a, b) => a.time - b.time);

  if (events.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Resolution Timeline</p>
      <div className="space-y-1.5">
        {events.map((ev, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 flex-shrink-0">{ev.icon}</span>
            <span className="text-foreground">{ev.text}</span>
            <span className="text-muted-foreground ml-auto flex-shrink-0">{formatTimestamp(ev.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
