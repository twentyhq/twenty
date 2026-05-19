import {
  SHARED_COMPANY_LOGO_URLS,
  SHARED_PEOPLE_AVATAR_URLS,
} from '@/content/site/asset-paths';

import { type TOKEN_TONES } from './token-tones';

type TokenTone = keyof typeof TOKEN_TONES;

type PersonData = {
  avatarUrl?: string;
  initials: string;
  name: string;
  tone: TokenTone;
};

type CompanyData = {
  domain?: string;
  initials: string;
  logoSrc?: string;
  name: string;
  squareTone: TokenTone;
};

type CardId = 'airbnb' | 'figma' | 'github' | 'notion';

type OpportunityCardData = {
  amount: string;
  company: CompanyData;
  contact: PersonData;
  date: string;
  header: CompanyData;
  id: CardId;
  owner: PersonData;
  rating: number;
  recordId: string;
};

const GITHUB_CARD: OpportunityCardData = {
  id: 'github',
  header: {
    domain: 'github.com',
    initials: 'G',
    logoSrc: SHARED_COMPANY_LOGO_URLS.github,
    name: 'Github',
    squareTone: 'gray',
  },
  amount: '$6,562.04',
  company: {
    domain: 'github.com',
    initials: 'G',
    logoSrc: SHARED_COMPANY_LOGO_URLS.github,
    name: 'Github',
    squareTone: 'gray',
  },
  owner: {
    avatarUrl: SHARED_PEOPLE_AVATAR_URLS.eddyCue,
    initials: 'E',
    name: 'Eddy Cue',
    tone: 'amber',
  },
  rating: 2,
  date: 'Jun 16, 2023',
  contact: {
    avatarUrl: SHARED_PEOPLE_AVATAR_URLS.chrisWanstrath,
    initials: 'C',
    name: 'Chris Wanstrath',
    tone: 'gray',
  },
  recordId: 'OPP-1',
};

const FIGMA_CARD: OpportunityCardData = {
  id: 'figma',
  header: {
    domain: 'figma.com',
    initials: 'F',
    logoSrc: SHARED_COMPANY_LOGO_URLS.figma,
    name: 'Figma',
    squareTone: 'purple',
  },
  amount: '$6,562.04',
  company: {
    domain: 'figma.com',
    initials: 'F',
    logoSrc: SHARED_COMPANY_LOGO_URLS.figma,
    name: 'Figma',
    squareTone: 'purple',
  },
  owner: {
    avatarUrl: SHARED_PEOPLE_AVATAR_URLS.jeffWilliams,
    initials: 'J',
    name: 'Jeff Williams',
    tone: 'blue',
  },
  rating: 2,
  date: 'Jun 21, 2023',
  contact: {
    avatarUrl: SHARED_PEOPLE_AVATAR_URLS.dylanField,
    initials: 'D',
    name: 'Dylan Field',
    tone: 'pink',
  },
  recordId: 'OPP-2',
};

const QUALIFIED_CARD: OpportunityCardData = {
  id: 'notion',
  header: {
    domain: 'notion.so',
    initials: 'N',
    logoSrc: SHARED_COMPANY_LOGO_URLS.notion,
    name: 'Notion',
    squareTone: 'gray',
  },
  amount: '$2,650',
  company: {
    domain: 'notion.so',
    initials: 'N',
    logoSrc: SHARED_COMPANY_LOGO_URLS.notion,
    name: 'Notion',
    squareTone: 'gray',
  },
  owner: { initials: 'A', name: 'Airbnb', tone: 'yellow' },
  rating: 2,
  date: 'Jun 6, 2023',
  contact: {
    avatarUrl: undefined,
    initials: 'I',
    name: 'Ivan Zhao',
    tone: 'gray',
  },
  recordId: 'OPP-6',
};

const AIRBNB_CARD: OpportunityCardData = {
  id: 'airbnb',
  header: {
    domain: 'airbnb.com',
    initials: 'A',
    logoSrc: SHARED_COMPANY_LOGO_URLS.airbnb,
    name: 'Airbnb',
    squareTone: 'pink',
  },
  amount: '$2,433.89',
  company: {
    domain: 'airbnb.com',
    initials: 'A',
    logoSrc: SHARED_COMPANY_LOGO_URLS.airbnb,
    name: 'Airbnb',
    squareTone: 'pink',
  },
  owner: {
    avatarUrl: SHARED_PEOPLE_AVATAR_URLS.katherineAdams,
    initials: 'K',
    name: 'Katherine Adams',
    tone: 'red',
  },
  rating: 3,
  date: 'Jun 6, 2023',
  contact: {
    avatarUrl: undefined,
    initials: 'I',
    name: 'Ivan Zhao',
    tone: 'gray',
  },
  recordId: 'OPP-8',
};

export const OPPORTUNITY_CARDS: Record<CardId, OpportunityCardData> = {
  airbnb: AIRBNB_CARD,
  figma: FIGMA_CARD,
  github: GITHUB_CARD,
  notion: QUALIFIED_CARD,
};

type LaneCards = [CardId[], CardId[]];

export const INITIAL_LANE_CARDS: LaneCards = [
  ['github', 'figma', 'airbnb'],
  ['notion'],
];

export const INITIAL_FLOATING_CARD_ID: CardId | null = null;
