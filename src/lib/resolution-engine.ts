import type { Resolution, Proposal, Dispute, Vote } from '@/types/resolution';
import { DEFAULT_CHALLENGE_PERIOD, DEFAULT_VOTE_PERIOD } from '@/types/resolution';
import { v4 as uuid } from 'uuid';

export function createResolution(requestId: string): Resolution {
  return {
    id: uuid(),
    requestId,
    proposals: [],
    disputes: [],
    currentProposalId: null,
    finalAnswer: null,
    resolvedAt: null,
    challengePeriodSeconds: DEFAULT_CHALLENGE_PERIOD,
    votePeriodSeconds: DEFAULT_VOTE_PERIOD,
  };
}

export function submitProposal(
  resolution: Resolution,
  proposerAddress: string,
  proposerAlias: string,
  answer: string,
): Resolution {
  if (resolution.finalAnswer !== null) {
    throw new Error('Resolution already finalized');
  }
  if (resolution.currentProposalId) {
    const current = resolution.proposals.find(p => p.id === resolution.currentProposalId);
    if (current && current.status === 'pending') {
      throw new Error('An active proposal already exists');
    }
  }

  const now = Date.now();
  const proposal: Proposal = {
    id: uuid(),
    requestId: resolution.requestId,
    proposerAddress,
    proposerAlias,
    answer,
    status: 'pending',
    createdAt: now,
    challengeDeadline: now + resolution.challengePeriodSeconds * 1000,
    disputeId: null,
  };

  return {
    ...resolution,
    proposals: [...resolution.proposals, proposal],
    currentProposalId: proposal.id,
  };
}

export function challengeProposal(
  resolution: Resolution,
  challengerAddress: string,
  challengerAlias: string,
  reason: string,
): Resolution {
  const proposal = resolution.proposals.find(p => p.id === resolution.currentProposalId);
  if (!proposal || proposal.status !== 'pending') {
    throw new Error('No active proposal to challenge');
  }
  if (Date.now() > proposal.challengeDeadline) {
    throw new Error('Challenge period has expired');
  }
  if (challengerAddress === proposal.proposerAddress) {
    throw new Error('Cannot challenge your own proposal');
  }

  const now = Date.now();
  const dispute: Dispute = {
    id: uuid(),
    proposalId: proposal.id,
    requestId: resolution.requestId,
    challengerAddress,
    challengerAlias,
    reason,
    createdAt: now,
    voteDeadline: now + resolution.votePeriodSeconds * 1000,
    votes: [],
    outcome: 'pending',
  };

  const updatedProposal: Proposal = {
    ...proposal,
    status: 'challenged',
    disputeId: dispute.id,
  };

  return {
    ...resolution,
    proposals: resolution.proposals.map(p =>
      p.id === proposal.id ? updatedProposal : p
    ),
    disputes: [...resolution.disputes, dispute],
  };
}

export function castVote(
  resolution: Resolution,
  disputeId: string,
  voterAddress: string,
  voterAlias: string,
  inFavor: boolean,
): Resolution {
  const dispute = resolution.disputes.find(d => d.id === disputeId);
  if (!dispute) throw new Error('Dispute not found');
  if (dispute.outcome !== 'pending') throw new Error('Dispute already resolved');
  if (Date.now() > dispute.voteDeadline) throw new Error('Vote period has expired');
  if (dispute.votes.some(v => v.voterAddress === voterAddress)) {
    throw new Error('Already voted');
  }

  const proposal = resolution.proposals.find(p => p.id === dispute.proposalId);
  if (voterAddress === proposal?.proposerAddress || voterAddress === dispute.challengerAddress) {
    throw new Error('Involved parties cannot vote');
  }

  const vote: Vote = { voterAddress, voterAlias, inFavor, timestamp: Date.now() };
  const updatedDispute: Dispute = {
    ...dispute,
    votes: [...dispute.votes, vote],
  };

  return {
    ...resolution,
    disputes: resolution.disputes.map(d => d.id === disputeId ? updatedDispute : d),
  };
}

export function checkExpiry(
  resolution: Resolution,
): { resolution: Resolution; settled: boolean; accepted: boolean } {
  const now = Date.now();
  const proposal = resolution.proposals.find(p => p.id === resolution.currentProposalId);
  if (!proposal || resolution.finalAnswer !== null) {
    return { resolution, settled: false, accepted: false };
  }

  // Pending proposal with expired challenge window → auto-accept
  if (proposal.status === 'pending' && now > proposal.challengeDeadline) {
    const accepted: Proposal = { ...proposal, status: 'accepted' };
    return {
      resolution: {
        ...resolution,
        proposals: resolution.proposals.map(p => p.id === proposal.id ? accepted : p),
        finalAnswer: proposal.answer,
        resolvedAt: now,
        currentProposalId: null,
      },
      settled: true,
      accepted: true,
    };
  }

  // Challenged proposal with expired vote window → tally
  if (proposal.status === 'challenged' && proposal.disputeId) {
    const dispute = resolution.disputes.find(d => d.id === proposal.disputeId);
    if (dispute && dispute.outcome === 'pending' && now > dispute.voteDeadline) {
      const votesFor = dispute.votes.filter(v => v.inFavor).length;
      const votesAgainst = dispute.votes.filter(v => !v.inFavor).length;
      const upheld = votesAgainst >= votesFor; // Tie or majority against → dispute upheld

      const updatedDispute: Dispute = {
        ...dispute,
        outcome: upheld ? 'upheld' : 'overturned',
      };

      const updatedProposal: Proposal = {
        ...proposal,
        status: upheld ? 'rejected' : 'accepted',
      };

      return {
        resolution: {
          ...resolution,
          proposals: resolution.proposals.map(p => p.id === proposal.id ? updatedProposal : p),
          disputes: resolution.disputes.map(d => d.id === dispute.id ? updatedDispute : d),
          currentProposalId: upheld ? null : null,
          finalAnswer: upheld ? null : proposal.answer,
          resolvedAt: upheld ? null : now,
        },
        settled: !upheld,
        accepted: !upheld,
      };
    }
  }

  return { resolution, settled: false, accepted: false };
}
