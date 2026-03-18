import type { Dispute } from '@/types/resolution';
import { useWallet } from '@/context/WalletContext';
import { useResolution } from '@/context/ResolutionContext';
import { ChallengeTimer } from './ChallengeTimer';
import { ThumbsUp, ThumbsDown, Users } from 'lucide-react';

interface Props {
  resolutionId: string;
  dispute: Dispute;
}

export function VotingPanel({ resolutionId, dispute }: Props) {
  const { wallet } = useWallet();
  const { dispatch } = useResolution();

  if (!wallet) return null;

  const hasVoted = dispute.votes.some(v => v.voterAddress === wallet.address);
  const isParty = wallet.address === dispute.challengerAddress;
  const votesFor = dispute.votes.filter(v => v.inFavor).length;
  const votesAgainst = dispute.votes.filter(v => !v.inFavor).length;
  const isPending = dispute.outcome === 'pending';

  function handleVote(inFavor: boolean) {
    dispatch({
      type: 'VOTE',
      payload: {
        resolutionId,
        disputeId: dispute.id,
        voterAddress: wallet!.address,
        voterAlias: wallet!.pseudonym,
        inFavor,
      },
    });
  }

  function handleExpiry() {
    dispatch({ type: 'CHECK_EXPIRY', payload: resolutionId });
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Community Vote</h4>
        {!isPending && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${dispute.outcome === 'upheld' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
            {dispute.outcome === 'upheld' ? 'Dispute Upheld' : 'Dispute Overturned'}
          </span>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1 font-mono">Dispute Reason:</p>
        <p className="text-sm text-foreground">{dispute.reason}</p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Filed by {dispute.challengerAlias}
        </p>
      </div>

      {isPending && (
        <ChallengeTimer deadline={dispute.voteDeadline} label="Vote Deadline" onExpiry={handleExpiry} />
      )}

      {/* Vote counts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm">
          <ThumbsUp className="w-4 h-4 text-success" />
          <span className="font-mono text-foreground">{votesFor}</span>
          <span className="text-xs text-muted-foreground">support proposal</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <ThumbsDown className="w-4 h-4 text-destructive" />
          <span className="font-mono text-foreground">{votesAgainst}</span>
          <span className="text-xs text-muted-foreground">support dispute</span>
        </div>
      </div>

      {/* Vote buttons */}
      {isPending && !hasVoted && !isParty && (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-success/10 hover:bg-success/20 text-success border border-success/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            Support Proposal
          </button>
          <button
            onClick={() => handleVote(false)}
            className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            Support Dispute
          </button>
        </div>
      )}

      {hasVoted && (
        <p className="text-xs text-muted-foreground font-mono">You have already voted.</p>
      )}
      {isParty && isPending && (
        <p className="text-xs text-muted-foreground font-mono">Involved parties cannot vote.</p>
      )}
    </div>
  );
}
