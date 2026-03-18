import type { IntelligenceRequest, Category } from '@/types/intelligence';
import { v4 as uuid } from 'uuid';

const now = Date.now();
const hour = 3600000;

interface SeedItem {
  question: string;
  category: Category;
  isPaid: boolean;
  bountyAmount: number | null;
  hoursAgo: number;
}

const seeds: SeedItem[] = [
  {
    question: 'What are the current satellite imagery indicators for unusual military staging near the Kaliningrad corridor?',
    category: 'Military',
    isPaid: true,
    bountyAmount: 250,
    hoursAgo: 2,
  },
  {
    question: 'Are there credible signals of a major cyber operation targeting European energy infrastructure in Q2?',
    category: 'Cyber',
    isPaid: true,
    bountyAmount: 500,
    hoursAgo: 5,
  },
  {
    question: 'What is the current status of rare earth mineral supply chain diversification away from Chinese sources?',
    category: 'Economic',
    isPaid: false,
    bountyAmount: null,
    hoursAgo: 8,
  },
  {
    question: 'Has there been any unusual maritime traffic patterns near the Strait of Hormuz in the last 72 hours?',
    category: 'Maritime',
    isPaid: true,
    bountyAmount: 150,
    hoursAgo: 12,
  },
  {
    question: 'What are the latest open-source assessments of North Korean nuclear warhead miniaturization progress?',
    category: 'Nuclear',
    isPaid: true,
    bountyAmount: 750,
    hoursAgo: 18,
  },
  {
    question: 'Community thread: Share analysis of the recent UN General Assembly voting patterns on Middle East resolutions.',
    category: 'Geopolitics',
    isPaid: false,
    bountyAmount: null,
    hoursAgo: 24,
  },
  {
    question: 'What commercial satellite launches from non-state actors should we be monitoring for dual-use capabilities?',
    category: 'Aerospace',
    isPaid: false,
    bountyAmount: null,
    hoursAgo: 36,
  },
  {
    question: 'Are there credible OSINT indicators linking recent Southeast Asian maritime incidents to state-sponsored actors?',
    category: 'Terrorism',
    isPaid: true,
    bountyAmount: 300,
    hoursAgo: 48,
  },
  {
    question: 'What economic sanctions evasion networks have been identified operating through UAE free trade zones?',
    category: 'Economic',
    isPaid: true,
    bountyAmount: 400,
    hoursAgo: 6,
  },
  {
    question: 'Community thread: Compile a list of new APT groups identified in 2026 with confirmed nation-state attribution.',
    category: 'Cyber',
    isPaid: false,
    bountyAmount: null,
    hoursAgo: 15,
  },
];

function makePseudonym(i: number): string {
  const adjs = ['Iron', 'Phantom', 'Cobalt', 'Eclipse', 'Storm', 'Void', 'Neon', 'Arctic', 'Ember', 'Stealth'];
  const nouns = ['Falcon', 'Sentinel', 'Wraith', 'Phoenix', 'Vanguard', 'Condor', 'Oracle', 'Raptor', 'Lynx', 'Titan'];
  return `${adjs[i % adjs.length]}-${nouns[i % nouns.length]}`;
}

export const seedRequests: IntelligenceRequest[] = seeds.map((s, i) => ({
  id: uuid(),
  question: s.question,
  category: s.category,
  isPaid: s.isPaid,
  bountyAmount: s.bountyAmount,
  status: 'open' as const,
  authorAddress: `0x${(i + 1).toString(16).padStart(40, '0')}`,
  authorAlias: makePseudonym(i),
  createdAt: now - s.hoursAgo * hour,
  updatedAt: now - s.hoursAgo * hour,
  threadId: null,
  escrowId: null,
  resolutionId: null,
  messageCount: 0,
}));
