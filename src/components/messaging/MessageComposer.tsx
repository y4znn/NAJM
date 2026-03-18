import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useMessaging } from '@/context/MessagingContext';
import { useIntelligence } from '@/context/IntelligenceContext';
import { sanitizeInput } from '@/lib/sanitize';
import { Send, Lock } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props {
  requestId: string;
  threadId: string | null;
}

export function MessageComposer({ requestId, threadId }: Props) {
  const { wallet } = useWallet();
  const { dispatch: msgDispatch } = useMessaging();
  const { dispatch: intDispatch } = useIntelligence();
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  if (!wallet) return null;

  function handleSend() {
    const cleaned = sanitizeInput(content);
    if (!cleaned) return;

    let tid = threadId;
    if (!tid) {
      tid = uuid();
      msgDispatch({ type: 'CREATE_THREAD', payload: { requestId } });
      intDispatch({ type: 'SET_THREAD', payload: { id: requestId, threadId: tid } });
    }

    msgDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        threadId: tid,
        requestId,
        senderAddress: wallet!.address,
        senderAlias: wallet!.pseudonym,
        content: cleaned,
        isPrivate,
        parentMessageId: null,
      },
    });

    intDispatch({ type: 'INCREMENT_MESSAGES', payload: requestId });
    setContent('');
  }

  return (
    <div className="border-t border-border pt-3 mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={isPrivate ? 'Send a private message to the requester...' : 'Send an anonymous message...'}
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        <button
          onClick={() => setIsPrivate(!isPrivate)}
          className={`p-2 rounded-lg border transition-colors ${isPrivate ? 'bg-warning/10 border-warning/50 text-warning' : 'border-border text-muted-foreground hover:text-foreground'}`}
          title={isPrivate ? 'Private message' : 'Public message'}
        >
          <Lock className="w-4 h-4" />
        </button>
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground p-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      {isPrivate && (
        <p className="text-[10px] text-warning mt-1 font-mono">
          Private: only visible to you and the requester
        </p>
      )}
    </div>
  );
}
