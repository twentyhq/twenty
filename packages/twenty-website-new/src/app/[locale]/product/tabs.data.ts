import { msg } from '@lingui/core/macro';

import type { TabType } from '@/sections/Tabs';

export const TABS: TabType[] = [
  {
    body: msg`Show me all deals closing this month`,
    icon: 'search',
    image: {
      src: '/images/product/tabs/deals.webp',
      alt: 'Deals view',
    },
  },
  {
    body: msg`Create follow-up tasks for my top 10 accounts`,
    icon: 'eye',
    image: {
      src: '/images/product/tabs/tasks.webp',
      alt: 'Tasks view',
    },
  },
  {
    body: msg`Summarize this customer's history`,
    icon: 'edit',
    image: {
      src: '/images/product/tabs/history.webp',
      alt: 'History view',
    },
  },
  {
    body: msg`Create a workflow that send an email sequence`,
    icon: 'check',
    image: {
      src: '/images/product/tabs/workflow.webp',
      alt: 'Workflow view',
    },
  },
];
