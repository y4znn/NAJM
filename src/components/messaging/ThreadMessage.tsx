import type { Message } from '@/types/messaging';
import { formatTimestamp } from '@/lib/utils';
import { User, Lock } from 'lucide-react';

export function ThreadMessage({ message }: { message: Message }) {
  return (
    <div className="flex gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold text-foreground">
            {message.senderAlias}
          </span>
          {message.isPrivate && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded">
              <Lock className="w-2.5 h-2.5" />
              Private
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatTimestamp(message.createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}
