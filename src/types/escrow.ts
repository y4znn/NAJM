export type EscrowStatus = 'locked' | 'pending_release' | 'disputed' | 'released' | 'refunded';

export interface EscrowTransaction {
  id: string;
  escrowId: string;
  action: 'lock' | 'propose_release' | 'dispute' | 'release' | 'refund';
  actorAddress: string;
  actorAlias: string;
  timestamp: number;
  details: string;
}

export interface EscrowState {
  id: string;
  requestId: string;
  depositorAddress: string;
  amount: number;
  recipientAddress: string | null;
  status: EscrowStatus;
  lockedAt: number;
  releasedAt: number | null;
  transactionLog: EscrowTransaction[];
}
