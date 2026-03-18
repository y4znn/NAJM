export const CATEGORIES = [
  'Aerospace',
  'Cyber',
  'Economic',
  'Geopolitics',
  'Maritime',
  'Military',
  'Nuclear',
  'Terrorism',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type RequestStatus = 'open' | 'proposed' | 'disputed' | 'resolved' | 'settled';

export interface IntelligenceRequest {
  id: string;
  question: string;
  category: Category;
  isPaid: boolean;
  bountyAmount: number | null;
  status: RequestStatus;
  authorAddress: string;
  authorAlias: string;
  createdAt: number;
  updatedAt: number;
  threadId: string | null;
  escrowId: string | null;
  resolutionId: string | null;
  messageCount: number;
}
