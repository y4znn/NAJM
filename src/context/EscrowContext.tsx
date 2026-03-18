import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { EscrowState, EscrowStatus } from '@/types/escrow';
import { createEscrow, transitionEscrow } from '@/lib/escrow-engine';
import { save, load } from '@/lib/storage';

type Action =
  | { type: 'LOAD'; payload: Record<string, EscrowState> }
  | { type: 'CREATE'; payload: { requestId: string; depositorAddress: string; amount: number } }
  | { type: 'TRANSITION'; payload: { escrowId: string; toStatus: EscrowStatus; actorAddress: string; actorAlias: string; details: string; recipientAddress?: string } };

function reducer(state: Record<string, EscrowState>, action: Action): Record<string, EscrowState> {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'CREATE': {
      const escrow = createEscrow(action.payload.requestId, action.payload.depositorAddress, action.payload.amount);
      return { ...state, [escrow.id]: escrow };
    }
    case 'TRANSITION': {
      const escrow = state[action.payload.escrowId];
      if (!escrow) return state;
      try {
        const updated = transitionEscrow(
          escrow,
          action.payload.toStatus,
          action.payload.actorAddress,
          action.payload.actorAlias,
          action.payload.details,
          action.payload.recipientAddress,
        );
        return { ...state, [escrow.id]: updated };
      } catch {
        return state;
      }
    }
    default:
      return state;
  }
}

interface EscrowContextValue {
  escrows: Record<string, EscrowState>;
  dispatch: React.Dispatch<Action>;
  getEscrow: (id: string) => EscrowState | undefined;
  getEscrowForRequest: (requestId: string) => EscrowState | undefined;
  getLastCreatedId: () => string | null;
}

const EscrowContext = createContext<EscrowContextValue | null>(null);
const STORAGE_KEY = 'escrows';

export function EscrowProvider({ children }: { children: ReactNode }) {
  const [escrows, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    const stored = load<Record<string, EscrowState>>(STORAGE_KEY);
    if (stored) dispatch({ type: 'LOAD', payload: stored });
  }, []);

  useEffect(() => {
    if (Object.keys(escrows).length > 0) {
      save(STORAGE_KEY, escrows);
    }
  }, [escrows]);

  function getEscrow(id: string) {
    return escrows[id];
  }

  function getEscrowForRequest(requestId: string) {
    return Object.values(escrows).find(e => e.requestId === requestId);
  }

  function getLastCreatedId() {
    const all = Object.values(escrows);
    if (all.length === 0) return null;
    return all.sort((a, b) => b.lockedAt - a.lockedAt)[0].id;
  }

  return (
    <EscrowContext.Provider value={{ escrows, dispatch, getEscrow, getEscrowForRequest, getLastCreatedId }}>
      {children}
    </EscrowContext.Provider>
  );
}

export function useEscrow() {
  const ctx = useContext(EscrowContext);
  if (!ctx) throw new Error('useEscrow must be used within EscrowProvider');
  return ctx;
}
