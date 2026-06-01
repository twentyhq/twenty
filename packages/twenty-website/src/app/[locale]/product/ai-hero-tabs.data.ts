import { msg } from '@lingui/core/macro';

import type { TabType } from '@/sections/Tabs';

export const AI_HERO_TABS: TabType[] = [
  {
    body: msg`Build a pipeline board grouped by stage`,
    icon: 'eye',
  },
  {
    body: msg`Generate follow-up tasks for my top 10 accounts`,
    icon: 'check',
  },
  {
    body: msg`Build a dashboard of pipeline by stage and ARR`,
    icon: 'lightbulb',
  },
  {
    body: msg`Draft a workflow that sends an email sequence`,
    icon: 'code',
  },
];
