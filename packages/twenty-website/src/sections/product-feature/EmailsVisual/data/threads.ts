import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';

import { type EmailThread } from '../types/email-thread';

const PEOPLE = sharedAssetUrls.peopleAvatars;

export const THREADS: EmailThread[] = [
  {
    date: 'Jun 24, 2026',
    messageCount: 4,
    participants: [
      { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix' },
      { avatarUrl: PEOPLE.anonymousThomas, name: 'Thomas' },
    ],
    preview:
      "Hey team, I've been in touch with Notion and Figma about potential integrations.",
    subject: 'Partnerships - Q4 Strategy',
  },
  {
    date: 'Jun 23, 2026',
    messageCount: 2,
    participants: [
      { avatarUrl: PEOPLE.anonymousLaura, name: 'Laura' },
      { avatarUrl: PEOPLE.anonymousIndira, name: 'Indira' },
    ],
    preview:
      'Dear Team, I am pleased to submit our proposal for your consideration. We have carefully reviewed your requirements.',
    subject: 'Proposal Submission',
  },
  {
    date: 'Jun 20, 2026',
    messageCount: 3,
    participants: [
      { avatarUrl: PEOPLE.anonymousIndira, name: 'Indira' },
      { avatarUrl: PEOPLE.anonymousMike, name: 'Mike' },
    ],
    preview:
      'Hi, I wanted to follow up on our conversation from last week regarding the new initiative.',
    subject: 'Follow-up on Discussion',
  },
  {
    date: 'Jun 18, 2026',
    messageCount: 1,
    participants: [
      { avatarUrl: PEOPLE.anonymousThomas, name: 'Thomas' },
      { avatarUrl: PEOPLE.anonymousLaura, name: 'Laura' },
    ],
    preview:
      'Hello, I wanted to share some positive feedback from our recent customer satisfaction survey.',
    subject: 'Customer Feedback',
  },
];
