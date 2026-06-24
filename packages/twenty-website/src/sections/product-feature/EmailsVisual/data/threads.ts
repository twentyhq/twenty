import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';

import { type EmailThread } from '../types/email-thread';

const PEOPLE = sharedAssetUrls.peopleAvatars;

export const THREADS: EmailThread[] = [
  {
    date: '1:30pm',
    messageCount: 2,
    participants: [{ avatarUrl: PEOPLE.anonymousMike, name: 'Mike' }],
    shared: false,
  },
  {
    date: '4 nov 2023',
    messageCount: 4,
    participants: [
      { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix' },
      { avatarUrl: PEOPLE.anonymousThomas, name: 'Thomas' },
    ],
    preview:
      "Hey team, I've been in touch with Notion and Figma about potential integrations.",
    shared: true,
    subject: 'Partnerships - Q4 Strategy',
  },
];
