export type ProposalStatus = 'pending' | 'challenged' | 'accepted' | 'rejected';

export interface Vote {
  voterAddress: string;
  voterAlias: string;
  inFavor: boolean;
  timestamp: number;
}

export interface Dispute {
  id: string;
  proposalId: string;
  requestId: string;
  challengerAddress: string;
  challengerAlias: string;
  reason: string;
  createdAt: number;
  voteDeadline: number;
  votes: Vote[];
  outcome: 'upheld' | 'overturned' | 'pending';
}

export interface Proposal {
  id: string;
  requestId: string;
  proposerAddress: string;
  proposerAlias: string;
  answer: string;
  status: ProposalStatus;
  createdAt: number;
  challengeDeadline: number;
  disputeId: string | null;
}

export interface Resolution {
  id: string;
  requestId: string;
  proposals: Proposal[];
  disputes: Dispute[];
  currentProposalId: string | null;
  finalAnswer: string | null;
  resolvedAt: number | null;
  challengePeriodSeconds: number;
  votePeriodSeconds: number;
}

export const DEFAULT_CHALLENGE_PERIOD = 300; // 5 minutes for demo
export const DEFAULT_VOTE_PERIOD = 300;
