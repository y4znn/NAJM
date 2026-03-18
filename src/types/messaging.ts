export interface Message {
  id: string;
  threadId: string;
  requestId: string;
  senderAddress: string;
  senderAlias: string;
  content: string;
  createdAt: number;
  isPrivate: boolean;
  parentMessageId: string | null;
}

export interface Thread {
  id: string;
  requestId: string;
  messages: Message[];
  participantCount: number;
  createdAt: number;
}
