import type { EscrowState, EscrowStatus, EscrowTransaction } from '@/types/escrow';
import { v4 as uuid } from 'uuid';

const VALID_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  locked: ['pending_release', 'refunded'],
  pending_release: ['disputed', 'released'],
  disputed: ['released', 'refunded'],
  released: [],
  refunded: [],
};

export function canTransition(from: EscrowStatus, to: EscrowStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function createEscrow(
  requestId: string,
  depositorAddress: string,
  amount: number,
): EscrowState {
  const id = uuid();
  const now = Date.now();
  return {
    id,
    requestId,
    depositorAddress,
    amount,
    recipientAddress: null,
    status: 'locked',
    lockedAt: now,
    releasedAt: null,
    transactionLog: [
      {
        id: uuid(),
        escrowId: id,
        action: 'lock',
        actorAddress: depositorAddress,
        actorAlias: '',
        timestamp: now,
        details: `Locked ${amount} USDC in escrow`,
      },
    ],
  };
}

export function transitionEscrow(
  state: EscrowState,
  toStatus: EscrowStatus,
  actorAddress: string,
  actorAlias: string,
  details: string,
  recipientAddress?: string,
): EscrowState {
  if (!canTransition(state.status, toStatus)) {
    throw new Error(`Invalid escrow transition: ${state.status} → ${toStatus}`);
  }

  const actionMap: Record<string, EscrowTransaction['action']> = {
    pending_release: 'propose_release',
    disputed: 'dispute',
    released: 'release',
    refunded: 'refund',
  };

  const tx: EscrowTransaction = {
    id: uuid(),
    escrowId: state.id,
    action: actionMap[toStatus] || 'lock',
    actorAddress,
    actorAlias,
    timestamp: Date.now(),
    details,
  };

  return {
    ...state,
    status: toStatus,
    recipientAddress: recipientAddress ?? state.recipientAddress,
    releasedAt: (toStatus === 'released' || toStatus === 'refunded') ? Date.now() : state.releasedAt,
    transactionLog: [...state.transactionLog, tx],
  };
}
