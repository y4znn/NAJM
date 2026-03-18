import { useState } from 'react';
import { CATEGORIES, type Category } from '@/types/intelligence';
import { useWallet } from '@/context/WalletContext';
import { useIntelligence } from '@/context/IntelligenceContext';
import { useEscrow } from '@/context/EscrowContext';
import { sanitizeQuestion, sanitizeAmount, validateCategory } from '@/lib/sanitize';
import { v4 as uuid } from 'uuid';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateRequestModal({ open, onClose }: Props) {
  const { wallet } = useWallet();
  const { dispatch: intDispatch } = useIntelligence();
  const { dispatch: escrowDispatch, getLastCreatedId } = useEscrow();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<Category>('Cyber');
  const [isPaid, setIsPaid] = useState(false);
  const [bountyStr, setBountyStr] = useState('');
  const [error, setError] = useState('');

  if (!open || !wallet) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const cleanQ = sanitizeQuestion(question);
    if (cleanQ.length < 10) {
      setError('Question must be at least 10 characters.');
      return;
    }
    if (!validateCategory(category)) {
      setError('Invalid category.');
      return;
    }

    let bountyAmount: number | null = null;
    if (isPaid) {
      bountyAmount = sanitizeAmount(bountyStr);
      if (!bountyAmount || bountyAmount < 1) {
        setError('Bounty must be at least 1 USDC.');
        return;
      }
    }

    const requestId = uuid();

    // Create escrow if paid
    let escrowId: string | null = null;
    if (isPaid && bountyAmount) {
      escrowDispatch({
        type: 'CREATE',
        payload: { requestId, depositorAddress: wallet!.address, amount: bountyAmount },
      });
      // We get the ID after dispatch settles — use a predictable approach
    }

    const now = Date.now();
    intDispatch({
      type: 'CREATE',
      payload: {
        id: requestId,
        question: cleanQ,
        category,
        isPaid,
        bountyAmount,
        status: 'open',
        authorAddress: wallet!.address,
        authorAlias: wallet!.pseudonym,
        createdAt: now,
        updatedAt: now,
        threadId: null,
        escrowId,
        resolutionId: null,
        messageCount: 0,
      },
    });

    // Reset form
    setQuestion('');
    setCategory('Cyber');
    setIsPaid(false);
    setBountyStr('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-foreground mb-1">New Intelligence Request</h2>
        <p className="text-xs text-muted-foreground mb-6 font-mono">
          All interactions are anonymous. Exercise operational security.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Intelligence Question
            </label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What intelligence are you seeking?"
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Paid Bounty</p>
              <p className="text-xs text-muted-foreground">Funds held in escrow until resolution</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPaid(!isPaid)}
              className={`relative w-11 h-6 rounded-full transition-colors ${isPaid ? 'bg-warning' : 'bg-border'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isPaid ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>

          {isPaid && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Bounty Amount (USDC)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={bountyStr}
                onChange={e => setBountyStr(e.target.value)}
                placeholder="50"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Submit Request
          </button>

          <p className="text-[10px] text-center text-muted-foreground font-mono">
            Posting as {wallet.pseudonym} ({wallet.address.slice(0, 10)}...)
          </p>
        </form>
      </div>
    </div>
  );
}
