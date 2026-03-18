import { useEffect } from 'react';
import type { Resolution } from '@/types/resolution';
import { useWallet } from '@/context/WalletContext';
import { useResolution } from '@/context/ResolutionContext';
import { ProposalForm } from './ProposalForm';
import { DisputeForm } from './DisputeForm';
import { VotingPanel } from './VotingPanel';
import { ChallengeTimer } from './ChallengeTimer';
import { ResolutionTimeline } from './ResolutionTimeline';
import { Scale, CheckCircle } from 'lucide-react';

interface Props {
  resolution: Resolution;
}

export function ResolutionPanel({ resolution }: Props) {
  const { wallet } = useWallet();
  const { dispatch } = useResolution();

  // Periodically check expiry
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CHECK_EXPIRY', payload: resolution.id });
    }, 2000);
    return () => clearInterval(interval);
  }, [resolution.id, dispatch]);

  const currentProposal = resolution.proposals.find(p => p.id === resolution.currentProposalId);
  const currentDispute = currentProposal?.disputeId
    ? resolution.disputes.find(d => d.id === currentProposal.disputeId)
    : undefined;

  const isResolved = resolution.finalAnswer !== null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Resolution Rules</h3>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
          UMA Optimistic Oracle
        </span>
      </div>

      {/* Resolved state */}
      {isResolved && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <h4 className="text-sm font-semibold text-success">Resolved</h4>
          </div>
          <p className="text-sm text-foreground">{resolution.finalAnswer}</p>
        </div>
      )}

      {/* Active proposal with challenge period */}
      {currentProposal && currentProposal.status === 'pending' && !isResolved && (
        <div className="space-y-3">
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">Proposed Answer by {currentProposal.proposerAlias}:</p>
            <p className="text-sm text-foreground">{currentProposal.answer}</p>
          </div>
          <ChallengeTimer
            deadline={currentProposal.challengeDeadline}
            label="Challenge Period"
            onExpiry={() => dispatch({ type: 'CHECK_EXPIRY', payload: resolution.id })}
          />
          {wallet && wallet.address !== currentProposal.proposerAddress && (
            <DisputeForm resolutionId={resolution.id} />
          )}
        </div>
      )}

      {/* Disputed — show voting */}
      {currentProposal && currentProposal.status === 'challenged' && currentDispute && !isResolved && (
        <div className="space-y-3">
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">Proposed Answer by {currentProposal.proposerAlias}:</p>
            <p className="text-sm text-foreground">{currentProposal.answer}</p>
          </div>
          <VotingPanel resolutionId={resolution.id} dispute={currentDispute} />
        </div>
      )}

      {/* No active proposal and not resolved — show proposal form */}
      {!currentProposal && !isResolved && (
        <ProposalForm resolutionId={resolution.id} />
      )}

      {/* If current proposal was rejected, allow new proposal */}
      {currentProposal && (currentProposal.status === 'rejected') && !isResolved && (
        <div className="space-y-3">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <p className="text-xs text-destructive font-mono">Previous proposal was rejected. Submit a new one.</p>
          </div>
          <ProposalForm resolutionId={resolution.id} />
        </div>
      )}

      {/* Timeline */}
      <ResolutionTimeline resolution={resolution} />
    </div>
  );
}
