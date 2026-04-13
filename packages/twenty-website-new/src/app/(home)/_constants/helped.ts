import type { HelpedDataType } from '@/sections/Helped/types/HelpedData';

export const HELPED_DATA: HelpedDataType = {
  eyebrow: {
    heading: {
      text: 'Twenty helped them',
      fontFamily: 'sans',
    },
  },
  heading: [
    {
      text: 'Make your GTM team happy with a',
      fontFamily: 'serif',
    },
    {
      text: " CRM they'll love",
      fontFamily: 'sans',
    },
  ],
  cards: [
    {
      icon: 'w3villa',
      heading: { text: 'Ship a product on Twenty', fontFamily: 'sans' },
      body: {
        text: 'W3villa built W3Grads — AI mock interviews at scale — on Twenty as the operational backbone.',
      },
      illustration: 'target',
      href: '/case-studies/w3villa',
    },
    {
      icon: 'act-education',
      heading: { text: 'Own your CRM end to end', fontFamily: 'sans' },
      body: {
        text: 'AC&T replaced a shuttered vendor CRM with self-hosted Twenty and cut CRM costs by more than 90%.',
      },
      illustration: 'spaceship',
      href: '/case-studies/act-education',
    },
    {
      icon: 'netzero',
      heading: { text: 'Grow with a flexible foundation', fontFamily: 'sans' },
      body: {
        text: 'NetZero runs a modular Twenty setup across carbon credits, ag products, and industrial systems.',
      },
      illustration: 'money',
      href: '/case-studies/netzero',
    },
  ],
};
