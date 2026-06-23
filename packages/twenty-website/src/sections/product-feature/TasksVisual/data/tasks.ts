import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';

import { type Task } from '../types/task';

const PEOPLE = sharedAssetUrls.peopleAvatars;

export const TASKS: Task[] = [
  {
    body: 'Loop in legal before sending.',
    done: false,
    due: 'Tomorrow',
    target: { avatarUrl: PEOPLE.darioAmodei, name: 'Dario Amodei' },
    title: 'Send NDA',
  },
  {
    body: 'Send the updated annual quote.',
    done: false,
    due: 'Jul 24',
    target: { avatarUrl: PEOPLE.patrickCollison, name: 'Patrick Collison' },
    title: 'Follow up on pricing',
  },
  {
    body: 'Use the Q3 template.',
    done: false,
    due: 'Jul 26',
    target: { avatarUrl: PEOPLE.dylanField, name: 'Dylan Field' },
    title: 'Onboarding deck',
  },
  {
    body: 'Coordinated with the data team.',
    done: true,
    due: 'Jul 18',
    target: { avatarUrl: PEOPLE.darioAmodei, name: 'Dario Amodei' },
    title: 'Schedule security review',
  },
];
