import type { IntelligenceRequest } from '@/types/intelligence';
import { BountyBadge } from './BountyBadge';
import { StatusIndicator } from './StatusIndicator';
import { formatTimestamp, cn } from '@/lib/utils';
import { MessageSquare, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function IntelligenceCard({ request }: { request: IntelligenceRequest }) {
  const { id, question, category, isPaid, bountyAmount, status, authorAlias, createdAt, messageCount } = request;

  return (
    <Link
      to={`/request/${id}`}
      className={cn(
        'block bg-card rounded-lg border transition-all hover:border-foreground/20 hover:bg-card/80 group no-underline',
        isPaid
          ? 'border-l-4 border-l-warning border-t-border border-r-border border-b-border'
          : 'border-l-4 border-l-muted-foreground/30 border-t-border border-r-border border-b-border'
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {category}
          </span>
          <StatusIndicator status={status} />
        </div>

        {/* Question */}
        <p className="text-sm text-foreground leading-relaxed line-clamp-3 group-hover:text-foreground/90">
          {question}
        </p>

        {/* Bounty or Free label */}
        <div>
          {isPaid && bountyAmount ? (
            <BountyBadge amount={bountyAmount} />
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">
              FREE
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="font-mono">{authorAlias}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{messageCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
