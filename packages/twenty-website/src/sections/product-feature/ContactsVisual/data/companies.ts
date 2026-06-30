import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';

import { type ContactCompany } from '../types/contact-company';

const PEOPLE = sharedAssetUrls.peopleAvatars;

export const COMPANIES: ContactCompany[] = [
  {
    name: 'Anthropic',
    domain: 'anthropic.com',
    createdBy: {
      name: 'Dario Amodei',
      tone: 'gray',
      avatarUrl: PEOPLE.darioAmodei,
    },
    address: '18 Rue De Navarin',
    accountOwner: {
      name: 'Dario Amodei',
      tone: 'gray',
      avatarUrl: PEOPLE.darioAmodei,
    },
    icp: true,
    arr: '$500,000',
    industry: 'AI Research',
  },
  {
    name: 'Linkedin',
    domain: 'linkedin.com',
    createdBy: {
      name: 'Reid Hoffman',
      tone: 'purple',
      avatarUrl: PEOPLE.reidHoffman,
    },
    address: '1226 Moises Causeway',
    accountOwner: {
      name: 'Ryan Roslansky',
      tone: 'turquoise',
      avatarUrl: PEOPLE.ryanRoslansky,
    },
    icp: false,
    arr: '$1,000,000',
    industry: 'Professional Networking',
  },
  {
    name: 'Slack',
    domain: 'slack.com',
    createdBy: {
      name: 'Stewart Butterfield',
      tone: 'turquoise',
      avatarUrl: PEOPLE.stewartButterfield,
    },
    address: '1316 Dameon Mountain',
    accountOwner: {
      name: 'Stewart Butterfield',
      tone: 'turquoise',
      avatarUrl: PEOPLE.stewartButterfield,
    },
    icp: true,
    arr: '$2,300,000',
    industry: 'Collaboration Software',
  },
  {
    name: 'Notion',
    domain: 'notion.com',
    createdBy: { name: 'API - Key name', source: 'api' },
    address: '1162 Sammy Creek',
    accountOwner: {
      name: 'Ivan Zhao',
      tone: 'gray',
      avatarUrl: PEOPLE.ivanZhao,
    },
    icp: false,
    arr: '$750,000',
    industry: 'Productivity Software',
  },
  {
    name: 'Figma',
    domain: 'figma.com',
    createdBy: { name: 'Workflow name', source: 'workflow' },
    address: '110 Oswald Junction',
    accountOwner: {
      name: 'Dylan Field',
      tone: 'purple',
      avatarUrl: PEOPLE.dylanField,
    },
    icp: true,
    arr: '$3,500,000',
    industry: 'Design Tools',
  },
  {
    name: 'Github',
    domain: 'github.com',
    createdBy: {
      name: 'Chris Wanstrath',
      tone: 'gray',
      avatarUrl: PEOPLE.chrisWanstrath,
    },
    address: '3891 Ranchview Drive',
    accountOwner: {
      name: 'Thomas Dohmke',
      tone: 'gray',
      avatarUrl: PEOPLE.thomasDohmke,
    },
    icp: true,
    arr: '$900,000',
    industry: 'Developer Platform',
  },
  {
    name: 'Airbnb',
    domain: 'airbnb.com',
    createdBy: {
      name: 'Brian Chesky',
      tone: 'pink',
      avatarUrl: PEOPLE.brianChesky,
    },
    address: '888 Brannan Street',
    accountOwner: {
      name: 'Brian Chesky',
      tone: 'pink',
      avatarUrl: PEOPLE.brianChesky,
    },
    icp: false,
    arr: '$1,800,000',
    industry: 'Travel & Hospitality',
  },
  {
    name: 'Stripe',
    domain: 'stripe.com',
    createdBy: {
      name: 'Patrick Collison',
      tone: 'blue',
      avatarUrl: PEOPLE.patrickCollison,
    },
    address: '354 Oyster Point Blvd',
    accountOwner: {
      name: 'Patrick Collison',
      tone: 'blue',
      avatarUrl: PEOPLE.patrickCollison,
    },
    icp: true,
    arr: '$4,200,000',
    industry: 'Fintech',
  },
  {
    name: 'Vercel',
    domain: 'vercel.com',
    createdBy: { name: 'Guillermo Rauch', tone: 'amber' },
    address: '340 S Lemon Ave',
    accountOwner: { name: 'Guillermo Rauch', tone: 'amber' },
    icp: true,
    arr: '$620,000',
    industry: 'Developer Platform',
  },
];
