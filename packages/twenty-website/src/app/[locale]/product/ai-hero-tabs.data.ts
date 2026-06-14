import { msg } from '@lingui/core/macro';

import type { TabType } from '@/sections/Tabs';

export const AI_HERO_TABS: TabType[] = [
  {
    body: msg`Build a pipeline board grouped by stage`,
    icon: 'kanban',
  },
  {
    body: msg`Generate tasks for my top 10 accounts`,
    icon: 'checklist',
  },
  {
    body: msg`Build a dashboard of pipeline by stage`,
    icon: 'chart',
  },
  {
    body: msg`Draft a workflow for an email sequence`,
    icon: 'workflow',
  },
];
