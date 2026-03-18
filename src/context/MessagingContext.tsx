import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Thread, Message } from '@/types/messaging';
import { save, load } from '@/lib/storage';
import { v4 as uuid } from 'uuid';

type Action =
  | { type: 'LOAD'; payload: Record<string, Thread> }
  | { type: 'CREATE_THREAD'; payload: { requestId: string } }
  | { type: 'ADD_MESSAGE'; payload: Omit<Message, 'id' | 'createdAt'> };

function reducer(state: Record<string, Thread>, action: Action): Record<string, Thread> {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'CREATE_THREAD': {
      const id = uuid();
      return {
        ...state,
        [id]: {
          id,
          requestId: action.payload.requestId,
          messages: [],
          participantCount: 0,
          createdAt: Date.now(),
        },
      };
    }
    case 'ADD_MESSAGE': {
      const thread = state[action.payload.threadId];
      if (!thread) return state;
      const msg: Message = {
        ...action.payload,
        id: uuid(),
        createdAt: Date.now(),
      };
      const participants = new Set(thread.messages.map(m => m.senderAddress));
      participants.add(msg.senderAddress);
      return {
        ...state,
        [thread.id]: {
          ...thread,
          messages: [...thread.messages, msg],
          participantCount: participants.size,
        },
      };
    }
    default:
      return state;
  }
}

interface MessagingContextValue {
  threads: Record<string, Thread>;
  dispatch: React.Dispatch<Action>;
  getThread: (threadId: string) => Thread | undefined;
  getThreadForRequest: (requestId: string) => Thread | undefined;
  createThreadId: () => string;
}

const MessagingContext = createContext<MessagingContextValue | null>(null);
const STORAGE_KEY = 'threads';

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [threads, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    const stored = load<Record<string, Thread>>(STORAGE_KEY);
    if (stored) dispatch({ type: 'LOAD', payload: stored });
  }, []);

  useEffect(() => {
    if (Object.keys(threads).length > 0) {
      save(STORAGE_KEY, threads);
    }
  }, [threads]);

  function getThread(threadId: string) {
    return threads[threadId];
  }

  function getThreadForRequest(requestId: string) {
    return Object.values(threads).find(t => t.requestId === requestId);
  }

  function createThreadId(): string {
    return uuid();
  }

  return (
    <MessagingContext.Provider value={{ threads, dispatch, getThread, getThreadForRequest, createThreadId }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used within MessagingProvider');
  return ctx;
}
