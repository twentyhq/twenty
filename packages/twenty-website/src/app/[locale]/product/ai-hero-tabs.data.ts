import { msg } from '@lingui/core/macro';

import type { TabType } from '@/sections/Tabs';

export const AI_HERO_TABS: TabType[] = [
  {
    body: msg`Show me all deals closing this month`,
    icon: 'search',
  },
  {
    body: msg`Create follow-up tasks for my top 10 accounts`,
    icon: 'check',
  },
  {
    body: msg`Summarize this customer's history`,
    icon: 'edit',
  },
  {
    body: msg`Create a workflow that sends an email sequence`,
    icon: 'code',
  },
];
