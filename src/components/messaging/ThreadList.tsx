import type { Thread } from '@/types/messaging';
import { ThreadMessage } from './ThreadMessage';
import { MessageSquare } from 'lucide-react';

interface Props {
  thread: Thread | undefined;
  currentUserAddress: string;
  requestAuthorAddress: string;
}

export function ThreadList({ thread, currentUserAddress, requestAuthorAddress }: Props) {
  if (!thread || thread.messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-xs">No messages yet. Start the conversation.</p>
      </div>
    );
  }

  const visibleMessages = thread.messages.filter(m => {
    if (!m.isPrivate) return true;
    return m.senderAddress === currentUserAddress || requestAuthorAddress === currentUserAddress;
  });

  return (
    <div className="divide-y-0">
      {visibleMessages.map(msg => (
        <ThreadMessage key={msg.id} message={msg} />
      ))}
    </div>
  );
}
