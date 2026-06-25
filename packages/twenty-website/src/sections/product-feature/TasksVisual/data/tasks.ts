import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';

import { type Task } from '../types/task';

const PEOPLE = sharedAssetUrls.peopleAvatars;

export const TASKS: Task[] = [
  {
    body: 'Loop in legal before sending.',
    done: false,
    due: 'Jul 22, 2026',
    id: 'send-nda',
    target: { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix Malfait' },
    title: 'Send NDA',
  },
  {
    body: 'Send the updated annual quote.',
    done: false,
    due: 'Jul 24, 2026',
    id: 'follow-up-pricing',
    target: { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix Malfait' },
    title: 'Follow up on pricing',
  },
  {
    body: 'Use the Q3 template.',
    done: false,
    due: 'Jul 26, 2026',
    id: 'prepare-onboarding-deck',
    target: { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix Malfait' },
    title: 'Prepare onboarding deck',
  },
  {
    body: 'Coordinated with the IT team.',
    done: true,
    due: 'Jul 18, 2026',
    id: 'schedule-security-review',
    target: { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix Malfait' },
    title: 'Schedule security review',
  },
];
