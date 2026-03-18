import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { IntelligenceRequest, Category, RequestStatus } from '@/types/intelligence';
import { save, load } from '@/lib/storage';

type Action =
  | { type: 'LOAD'; payload: IntelligenceRequest[] }
  | { type: 'CREATE'; payload: IntelligenceRequest }
  | { type: 'UPDATE_STATUS'; payload: { id: string; status: RequestStatus } }
  | { type: 'SET_ESCROW'; payload: { id: string; escrowId: string } }
  | { type: 'SET_RESOLUTION'; payload: { id: string; resolutionId: string } }
  | { type: 'SET_THREAD'; payload: { id: string; threadId: string } }
  | { type: 'INCREMENT_MESSAGES'; payload: string };

function reducer(state: IntelligenceRequest[], action: Action): IntelligenceRequest[] {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'CREATE':
      return [action.payload, ...state];
    case 'UPDATE_STATUS':
      return state.map(r =>
        r.id === action.payload.id
          ? { ...r, status: action.payload.status, updatedAt: Date.now() }
          : r
      );
    case 'SET_ESCROW':
      return state.map(r =>
        r.id === action.payload.id ? { ...r, escrowId: action.payload.escrowId } : r
      );
    case 'SET_RESOLUTION':
      return state.map(r =>
        r.id === action.payload.id ? { ...r, resolutionId: action.payload.resolutionId } : r
      );
    case 'SET_THREAD':
      return state.map(r =>
        r.id === action.payload.id ? { ...r, threadId: action.payload.threadId } : r
      );
    case 'INCREMENT_MESSAGES':
      return state.map(r =>
        r.id === action.payload ? { ...r, messageCount: r.messageCount + 1 } : r
      );
    default:
      return state;
  }
}

interface IntelligenceContextValue {
  requests: IntelligenceRequest[];
  dispatch: React.Dispatch<Action>;
  getRequest: (id: string) => IntelligenceRequest | undefined;
  getFiltered: (opts: {
    search?: string;
    category?: Category | null;
    paidOnly?: boolean;
  }) => IntelligenceRequest[];
}

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null);

const STORAGE_KEY = 'requests';

export function IntelligenceProvider({ children }: { children: ReactNode }) {
  const [requests, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const stored = load<IntelligenceRequest[]>(STORAGE_KEY);
    if (stored && stored.length > 0) {
      dispatch({ type: 'LOAD', payload: stored });
    } else {
      import('@/data/seed').then(m => {
        dispatch({ type: 'LOAD', payload: m.seedRequests });
      });
    }
  }, []);

  useEffect(() => {
    if (requests.length > 0) {
      save(STORAGE_KEY, requests);
    }
  }, [requests]);

  function getRequest(id: string) {
    return requests.find(r => r.id === id);
  }

  function getFiltered({
    search,
    category,
    paidOnly,
  }: {
    search?: string;
    category?: Category | null;
    paidOnly?: boolean;
  }) {
    let result = requests;
    if (category) {
      result = result.filter(r => r.category === category);
    }
    if (paidOnly) {
      result = result.filter(r => r.isPaid);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => r.question.toLowerCase().includes(q));
    }
    return result;
  }

  return (
    <IntelligenceContext.Provider value={{ requests, dispatch, getRequest, getFiltered }}>
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  const ctx = useContext(IntelligenceContext);
  if (!ctx) throw new Error('useIntelligence must be used within IntelligenceProvider');
  return ctx;
}
