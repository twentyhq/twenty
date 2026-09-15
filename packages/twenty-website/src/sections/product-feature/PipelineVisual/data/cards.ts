import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';

import { type DealData } from '../types/deal-data';
import { type PipelineCardId } from '../types/pipeline-card-id';

const PEOPLE = sharedAssetUrls.peopleAvatars;

export const CARDS: Record<PipelineCardId, DealData> = {
  github: {
    amount: '$75k',
    avatarTone: 'blue',
    company: { domain: 'github.com', name: 'Github' },
    contact: { avatarUrl: PEOPLE.chrisWanstrath, name: 'Chris Wanstrath' },
    createdBy: { name: 'System', source: 'system' },
    date: 'Jan 25, 2026 9:26 PM',
    id: 'github',
    title: 'API Integration Deal',
  },
  figma: {
    amount: '$30k',
    avatarTone: 'orange',
    company: { domain: 'figma.com', name: 'Figma' },
    contact: { avatarUrl: PEOPLE.dylanField, name: 'Dylan Field' },
    createdBy: { name: 'System', source: 'system' },
    date: 'Jan 15, 2026 9:27 PM',
    id: 'figma',
    title: 'Design Partnership',
  },
  airbnb: {
    amount: '$50k',
    avatarTone: 'green',
    company: { domain: 'airbnb.com', name: 'Airbnb' },
    contact: { avatarUrl: PEOPLE.brianChesky, name: 'Brian Chesky' },
    createdBy: {
      avatarUrl: PEOPLE.eddyCue,
      name: 'Eddy Cue',
      source: 'member',
    },
    date: 'Mar 10, 2026 9:26 PM',
    id: 'airbnb',
    title: 'Enterprise Plan Upgrade',
  },
  notion: {
    amount: '$45k',
    avatarTone: 'purple',
    company: { domain: 'notion.com', name: 'Notion' },
    contact: { avatarUrl: PEOPLE.ivanZhao, name: 'Ivan Zhao' },
    createdBy: {
      avatarUrl: PEOPLE.anonymousFelix,
      name: 'Félix Malfait',
      source: 'member',
    },
    date: 'Feb 18, 2026 3:14 PM',
    id: 'notion',
    title: 'Workspace Rollout',
  },
  stripe: {
    amount: '$60k',
    avatarTone: 'pink',
    company: { domain: 'stripe.com', name: 'Stripe' },
    contact: { avatarUrl: PEOPLE.patrickCollison, name: 'Patrick Collison' },
    createdBy: { name: 'System', source: 'system' },
    date: 'Feb 2, 2026 11:02 AM',
    id: 'stripe',
    title: 'Billing Expansion',
  },
};
