import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { useIntelligence } from '@/context/IntelligenceContext';
import { useEscrow } from '@/context/EscrowContext';
import { useResolution } from '@/context/ResolutionContext';
import { useMessaging } from '@/context/MessagingContext';
import { BountyBadge } from '@/components/intelligence/BountyBadge';
import { StatusIndicator } from '@/components/intelligence/StatusIndicator';
import { EscrowDetails } from '@/components/escrow/EscrowDetails';
import { EscrowActions } from '@/components/escrow/EscrowActions';
import { ResolutionPanel } from '@/components/resolution/ResolutionPanel';
import { ThreadList } from '@/components/messaging/ThreadList';
import { MessageComposer } from '@/components/messaging/MessageComposer';
import { formatTimestamp } from '@/lib/utils';
import { ArrowLeft, User, Clock } from 'lucide-react';
import { checkExpiry } from '@/lib/resolution-engine';

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { wallet } = useWallet();
  const { getRequest, dispatch: intDispatch } = useIntelligence();
  const { getEscrowForRequest, dispatch: escrowDispatch } = useEscrow();
  const {
    getResolutionForRequest,
    dispatch: resDispatch,
  } = useResolution();
  const { getThread, getThreadForRequest } = useMessaging();

  const request = id ? getRequest(id) : undefined;
  const escrow = request ? getEscrowForRequest(request.id) : undefined;
  const resolution = request ? getResolutionForRequest(request.id) : undefined;
  const thread = request?.threadId
    ? getThread(request.threadId)
    : request
      ? getThreadForRequest(request.id)
      : undefined;

  // Auto-create escrow for paid requests that don't have one yet
  useEffect(() => {
    if (request && request.isPaid && !escrow) {
      escrowDispatch({
        type: 'CREATE',
        payload: {
          requestId: request.id,
          depositorAddress: request.authorAddress,
          amount: request.bountyAmount || 0,
        },
      });
    }
  }, [request, escrow, escrowDispatch]);

  // Auto-create resolution for paid requests that don't have one yet
  useEffect(() => {
    if (request && request.isPaid && !resolution) {
      resDispatch({ type: 'CREATE', payload: { requestId: request.id } });
    }
  }, [request, resolution, resDispatch]);

  // Sync resolution ID back to request
  const currentResolution = request ? getResolutionForRequest(request.id) : undefined;
  useEffect(() => {
    if (request && currentResolution && !request.resolutionId) {
      intDispatch({ type: 'SET_RESOLUTION', payload: { id: request.id, resolutionId: currentResolution.id } });
    }
  }, [request, currentResolution, intDispatch]);

  // Sync escrow state → request status
  useEffect(() => {
    if (!request || !escrow) return;
    if (escrow.status === 'released' && request.status !== 'settled') {
      intDispatch({ type: 'UPDATE_STATUS', payload: { id: request.id, status: 'settled' } });
    } else if (escrow.status === 'refunded' && request.status !== 'settled') {
      intDispatch({ type: 'UPDATE_STATUS', payload: { id: request.id, status: 'settled' } });
    }
  }, [escrow, request, intDispatch]);

  // Sync resolution state → request status + escrow transitions
  useEffect(() => {
    if (!request || !currentResolution) return;
    const currentProposal = currentResolution.proposals.find(p => p.id === currentResolution.currentProposalId);

    if (currentProposal?.status === 'pending' && request.status === 'open') {
      intDispatch({ type: 'UPDATE_STATUS', payload: { id: request.id, status: 'proposed' } });
    }
    if (currentProposal?.status === 'challenged' && request.status !== 'disputed') {
      intDispatch({ type: 'UPDATE_STATUS', payload: { id: request.id, status: 'disputed' } });
    }
    if (currentResolution.finalAnswer && request.status !== 'resolved' && request.status !== 'settled') {
      intDispatch({ type: 'UPDATE_STATUS', payload: { id: request.id, status: 'resolved' } });
      // Release escrow
      if (escrow && escrow.status === 'locked') {
        escrowDispatch({
          type: 'TRANSITION',
          payload: {
            escrowId: escrow.id,
            toStatus: 'pending_release',
            actorAddress: 'system',
            actorAlias: 'System',
            details: 'Proposal accepted — releasing escrow',
          },
        });
        // Then release
        setTimeout(() => {
          escrowDispatch({
            type: 'TRANSITION',
            payload: {
              escrowId: escrow.id,
              toStatus: 'released',
              actorAddress: 'system',
              actorAlias: 'System',
              details: `Released ${escrow.amount} USDC to resolver`,
              recipientAddress: currentProposal?.proposerAddress,
            },
          });
        }, 100);
      }
    }
  }, [currentResolution, request, escrow, intDispatch, escrowDispatch]);

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Request not found.</p>
        <Link to="/" className="text-primary text-sm mt-4 inline-block">Back to feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </Link>

      {/* Request detail */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {request.category}
          </span>
          <StatusIndicator status={request.status} />
        </div>

        <h2 className="text-lg font-semibold text-foreground leading-relaxed">
          {request.question}
        </h2>

        <div className="flex items-center gap-4 flex-wrap">
          {request.isPaid && request.bountyAmount ? (
            <BountyBadge amount={request.bountyAmount} />
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">
              FREE
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="font-mono">{request.authorAlias}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(request.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Escrow section (paid only) */}
      {request.isPaid && escrow && (
        <div className="space-y-2">
          <EscrowDetails escrow={escrow} />
          <EscrowActions escrow={escrow} />
        </div>
      )}

      {/* Resolution section (paid only) */}
      {request.isPaid && currentResolution && (
        <ResolutionPanel resolution={currentResolution} />
      )}

      {/* Threaded messages */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Intelligence Thread</h3>
        <ThreadList
          thread={thread}
          currentUserAddress={wallet?.address || ''}
          requestAuthorAddress={request.authorAddress}
        />
        <MessageComposer requestId={request.id} threadId={request.threadId} />
      </div>
    </div>
  );
}
