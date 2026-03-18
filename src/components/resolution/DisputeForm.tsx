import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useResolution } from '@/context/ResolutionContext';
import { sanitizeInput } from '@/lib/sanitize';
import { AlertTriangle } from 'lucide-react';

interface Props {
  resolutionId: string;
}

export function DisputeForm({ resolutionId }: Props) {
  const { wallet } = useWallet();
  const { dispatch } = useResolution();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!wallet) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const cleaned = sanitizeInput(reason);
    if (cleaned.length < 5) {
      setError('Please provide a reason for the dispute.');
      return;
    }

    dispatch({
      type: 'CHALLENGE',
      payload: {
        resolutionId,
        challengerAddress: wallet!.address,
        challengerAlias: wallet!.pseudonym,
        reason: cleaned,
      },
    });
    setReason('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-destructive/30 rounded-lg p-3 bg-destructive/5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h4 className="text-sm font-semibold text-destructive">Challenge This Proposal</h4>
      </div>
      <input
        type="text"
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Reason for dispute..."
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        File Dispute
      </button>
    </form>
  );
}
