import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';

// The four opportunity cards the scene deals, extracted verbatim from
// the old familiar-interface data (mock product fiction stays English).
export type FamiliarTokenTone =
  | 'amber'
  | 'blue'
  | 'gray'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

export type FamiliarPersonData = {
  avatarUrl?: string;
  initials: string;
  name: string;
  tone: FamiliarTokenTone;
};

export type FamiliarCompanyData = {
  initials: string;
  logoSrc?: string;
  name: string;
  squareTone: FamiliarTokenTone;
};

export type FamiliarCardId = 'airbnb' | 'figma' | 'github' | 'notion';

export type FamiliarOpportunityCardData = {
  amount: string;
  company: FamiliarCompanyData;
  contact: FamiliarPersonData;
  date: string;
  header: FamiliarCompanyData;
  id: FamiliarCardId;
  owner: FamiliarPersonData;
  rating: number;
  recordId: string;
};

export type FamiliarLaneCards = [FamiliarCardId[], FamiliarCardId[]];

const GITHUB_COMPANY: FamiliarCompanyData = {
  initials: 'G',
  logoSrc: sharedAssetUrls.companyLogoForDomain('github.com'),
  name: 'Github',
  squareTone: 'gray',
};

const FIGMA_COMPANY: FamiliarCompanyData = {
  initials: 'F',
  logoSrc: sharedAssetUrls.companyLogoForDomain('figma.com'),
  name: 'Figma',
  squareTone: 'purple',
};

const NOTION_COMPANY: FamiliarCompanyData = {
  initials: 'N',
  logoSrc: sharedAssetUrls.companyLogoForDomain('notion.com'),
  name: 'Notion',
  squareTone: 'gray',
};

const AIRBNB_COMPANY: FamiliarCompanyData = {
  initials: 'A',
  logoSrc: sharedAssetUrls.companyLogoForDomain('airbnb.com'),
  name: 'Airbnb',
  squareTone: 'pink',
};

const GITHUB_CARD: FamiliarOpportunityCardData = {
  id: 'github',
  header: GITHUB_COMPANY,
  amount: '$6,562.04',
  company: GITHUB_COMPANY,
  owner: {
    avatarUrl: sharedAssetUrls.peopleAvatars.eddyCue,
    initials: 'E',
    name: 'Eddy Cue',
    tone: 'amber',
  },
  rating: 2,
  date: 'Jun 16, 2023',
  contact: {
    avatarUrl: sharedAssetUrls.peopleAvatars.chrisWanstrath,
    initials: 'C',
    name: 'Chris Wanstrath',
    tone: 'gray',
  },
  recordId: 'OPP-1',
};

const FIGMA_CARD: FamiliarOpportunityCardData = {
  id: 'figma',
  header: FIGMA_COMPANY,
  amount: '$6,562.04',
  company: FIGMA_COMPANY,
  owner: {
    avatarUrl: sharedAssetUrls.peopleAvatars.jeffWilliams,
    initials: 'J',
    name: 'Jeff Williams',
    tone: 'blue',
  },
  rating: 2,
  date: 'Jun 21, 2023',
  contact: {
    avatarUrl: sharedAssetUrls.peopleAvatars.dylanField,
    initials: 'D',
    name: 'Dylan Field',
    tone: 'pink',
  },
  recordId: 'OPP-2',
};

const NOTION_CARD: FamiliarOpportunityCardData = {
  id: 'notion',
  header: NOTION_COMPANY,
  amount: '$2,650',
  company: NOTION_COMPANY,
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

const AIRBNB_CARD: FamiliarOpportunityCardData = {
  id: 'airbnb',
  header: AIRBNB_COMPANY,
  amount: '$2,433.89',
  company: AIRBNB_COMPANY,
  owner: {
    avatarUrl: sharedAssetUrls.peopleAvatars.katherineAdams,
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

const OPPORTUNITY_CARDS: Record<FamiliarCardId, FamiliarOpportunityCardData> = {
  airbnb: AIRBNB_CARD,
  figma: FIGMA_CARD,
  github: GITHUB_CARD,
  notion: NOTION_CARD,
};

const INITIAL_LANE_CARDS: FamiliarLaneCards = [
  ['github', 'figma', 'airbnb'],
  ['notion'],
];

export const FAMILIAR_INTERFACE_CARDS = {
  opportunityCards: OPPORTUNITY_CARDS,
  initialLaneCards: INITIAL_LANE_CARDS,
};
