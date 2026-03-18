import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useResolution } from '@/context/ResolutionContext';
import { sanitizeAnswer } from '@/lib/sanitize';
import { FileCheck } from 'lucide-react';

interface Props {
  resolutionId: string;
}

export function ProposalForm({ resolutionId }: Props) {
  const { wallet } = useWallet();
  const { dispatch } = useResolution();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  if (!wallet) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const cleaned = sanitizeAnswer(answer);
    if (cleaned.length < 10) {
      setError('Answer must be at least 10 characters.');
      return;
    }

    dispatch({
      type: 'SUBMIT_PROPOSAL',
      payload: {
        resolutionId,
        proposerAddress: wallet!.address,
        proposerAlias: wallet!.pseudonym,
        answer: cleaned,
      },
    });
    setAnswer('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <FileCheck className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Propose an Answer</h4>
      </div>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Submit your intelligence answer for verification..."
        rows={3}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Submit Proposal
      </button>
      <p className="text-[10px] text-muted-foreground font-mono">
        A 5-minute challenge period begins after submission. If unchallenged, the answer is accepted.
      </p>
    </form>
  );
}
