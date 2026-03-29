import { TabsDataType } from '@/sections/Tabs/types';

export const TABS_DATA: TabsDataType = {
  eyebrow: {
    heading: {
      text: 'AI & Automation',
      fontFamily: 'sans',
    },
  },
  heading: [
    {
      text: 'AI that actually helps you ',
      fontFamily: 'serif',
    },
    {
      text: 'work faster',
      fontFamily: 'sans',
    },
  ],
  body: {
    text: 'The AI understands your CRM and takes action.',
  },
  tabs: [
    {
      body: {
        text: 'Show me all deals closing this month',
      },
      image: {
        src: '/images/product/tabs/deals.png',
        alt: 'Deals view',
      },
    },
    {
      body: {
        text: 'Create follow-up tasks for my top 10 accounts',
      },
      image: {
        src: '/images/product/tabs/tasks.png',
        alt: 'Tasks view',
      },
    },
    {
      body: {
        text: "Summarize this customer's history",
      },
      image: {
        src: '/images/product/tabs/history.png',
        alt: 'History view',
      },
    },
    {
      body: {
        text: 'Create a workflow that send an email sequence',
      },
      image: {
        src: '/images/product/tabs/workflow.png',
        alt: 'Workflow view',
      },
    },
  ],
};
