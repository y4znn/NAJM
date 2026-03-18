import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Resolution } from '@/types/resolution';
import {
  createResolution,
  submitProposal,
  challengeProposal,
  castVote,
  checkExpiry,
} from '@/lib/resolution-engine';
import { save, load } from '@/lib/storage';

type Action =
  | { type: 'LOAD'; payload: Record<string, Resolution> }
  | { type: 'CREATE'; payload: { requestId: string } }
  | { type: 'SUBMIT_PROPOSAL'; payload: { resolutionId: string; proposerAddress: string; proposerAlias: string; answer: string } }
  | { type: 'CHALLENGE'; payload: { resolutionId: string; challengerAddress: string; challengerAlias: string; reason: string } }
  | { type: 'VOTE'; payload: { resolutionId: string; disputeId: string; voterAddress: string; voterAlias: string; inFavor: boolean } }
  | { type: 'CHECK_EXPIRY'; payload: string }
  | { type: 'UPDATE'; payload: Resolution };

function reducer(state: Record<string, Resolution>, action: Action): Record<string, Resolution> {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'CREATE': {
      const res = createResolution(action.payload.requestId);
      return { ...state, [res.id]: res };
    }
    case 'SUBMIT_PROPOSAL': {
      const res = state[action.payload.resolutionId];
      if (!res) return state;
      try {
        const updated = submitProposal(res, action.payload.proposerAddress, action.payload.proposerAlias, action.payload.answer);
        return { ...state, [res.id]: updated };
      } catch { return state; }
    }
    case 'CHALLENGE': {
      const res = state[action.payload.resolutionId];
      if (!res) return state;
      try {
        const updated = challengeProposal(res, action.payload.challengerAddress, action.payload.challengerAlias, action.payload.reason);
        return { ...state, [res.id]: updated };
      } catch { return state; }
    }
    case 'VOTE': {
      const res = state[action.payload.resolutionId];
      if (!res) return state;
      try {
        const updated = castVote(res, action.payload.disputeId, action.payload.voterAddress, action.payload.voterAlias, action.payload.inFavor);
        return { ...state, [res.id]: updated };
      } catch { return state; }
    }
    case 'CHECK_EXPIRY': {
      const res = state[action.payload];
      if (!res) return state;
      const { resolution } = checkExpiry(res);
      return { ...state, [res.id]: resolution };
    }
    case 'UPDATE':
      return { ...state, [action.payload.id]: action.payload };
    default:
      return state;
  }
}

interface ResolutionContextValue {
  resolutions: Record<string, Resolution>;
  dispatch: React.Dispatch<Action>;
  getResolution: (id: string) => Resolution | undefined;
  getResolutionForRequest: (requestId: string) => Resolution | undefined;
  getLastCreatedId: () => string | null;
}

const ResolutionContext = createContext<ResolutionContextValue | null>(null);
const STORAGE_KEY = 'resolutions';

export function ResolutionProvider({ children }: { children: ReactNode }) {
  const [resolutions, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    const stored = load<Record<string, Resolution>>(STORAGE_KEY);
    if (stored) dispatch({ type: 'LOAD', payload: stored });
  }, []);

  useEffect(() => {
    if (Object.keys(resolutions).length > 0) {
      save(STORAGE_KEY, resolutions);
    }
  }, [resolutions]);

  function getResolution(id: string) {
    return resolutions[id];
  }

  function getResolutionForRequest(requestId: string) {
    return Object.values(resolutions).find(r => r.requestId === requestId);
  }

  function getLastCreatedId() {
    const all = Object.values(resolutions);
    if (all.length === 0) return null;
    return all[all.length - 1].id;
  }

  return (
    <ResolutionContext.Provider value={{ resolutions, dispatch, getResolution, getResolutionForRequest, getLastCreatedId }}>
      {children}
    </ResolutionContext.Provider>
  );
}

export function useResolution() {
  const ctx = useContext(ResolutionContext);
  if (!ctx) throw new Error('useResolution must be used within ResolutionProvider');
  return ctx;
}
