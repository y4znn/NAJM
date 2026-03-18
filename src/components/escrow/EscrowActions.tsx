import type { EscrowState } from '@/types/escrow';
import { useWallet } from '@/context/WalletContext';
import { useEscrow } from '@/context/EscrowContext';
import { canTransition } from '@/lib/escrow-engine';

interface Props {
  escrow: EscrowState;
}

export function EscrowActions({ escrow }: Props) {
  const { wallet } = useWallet();
  const { dispatch } = useEscrow();

  if (!wallet) return null;

  const isDepositor = wallet.address === escrow.depositorAddress;

  function handleRefund() {
    dispatch({
      type: 'TRANSITION',
      payload: {
        escrowId: escrow.id,
        toStatus: 'refunded',
        actorAddress: wallet!.address,
        actorAlias: wallet!.pseudonym,
        details: `Refunded ${escrow.amount} USDC to depositor`,
      },
    });
  }

  // Only depositor can refund, and only from valid states
  if (isDepositor && canTransition(escrow.status, 'refunded')) {
    return (
      <button
        onClick={handleRefund}
        className="text-xs text-destructive hover:text-destructive/80 border border-destructive/30 rounded px-3 py-1.5 transition-colors"
      >
        Cancel & Refund
      </button>
    );
  }

  return null;
}
