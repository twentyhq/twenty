import { msg } from '@lingui/core/macro';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';

import { type Task } from '../types/task';

const PEOPLE = sharedAssetUrls.peopleAvatars;

export const TASKS: Task[] = [
  {
    body: msg`Loop in legal before sending.`,
    done: false,
    due: 'Jul 22, 2026',
    id: 'send-nda',
    target: { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix Malfait' },
    title: msg`Send NDA`,
  },
  {
    body: msg`Send the updated annual quote.`,
    done: false,
    due: 'Jul 24, 2026',
    id: 'follow-up-pricing',
    target: { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix Malfait' },
    title: msg`Follow up on pricing`,
  },
  {
    body: msg`Use the Q3 template.`,
    done: false,
    due: 'Jul 26, 2026',
    id: 'prepare-onboarding-deck',
    target: { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix Malfait' },
    title: msg`Prepare onboarding deck`,
  },
  {
    body: msg`Coordinated with the IT team.`,
    done: true,
    due: 'Jul 18, 2026',
    id: 'schedule-security-review',
    target: { avatarUrl: PEOPLE.anonymousFelix, name: 'Félix Malfait' },
    title: msg`Schedule security review`,
  },
];
