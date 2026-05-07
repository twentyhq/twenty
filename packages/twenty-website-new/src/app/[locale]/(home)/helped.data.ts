import { msg } from '@lingui/core/macro';
import type { HelpedDataType } from '@/sections/Helped/types/HelpedData';

export const HELPED_DATA: HelpedDataType = {
  eyebrow: {
    heading: {
      text: msg`In production.`,
      fontFamily: 'sans',
    },
  },
  cards: [
    {
      icon: 'w3villa',
      heading: { text: msg`Ship a product on Twenty`, fontFamily: 'sans' },
      body: {
        text: msg`W3villa built W3Grads for AI mock interviews at scale, with Twenty as the operational backbone.`,
      },
      illustration: 'target',
      href: '/customers/w3villa',
    },
    {
      icon: 'act-education',
      heading: { text: msg`Own your CRM end to end`, fontFamily: 'sans' },
      body: {
        text: msg`AC&T replaced a shuttered vendor CRM with self-hosted Twenty and cut CRM costs by more than 90%.`,
      },
      illustration: 'spaceship',
      href: '/customers/act-education',
    },
    {
      icon: 'netzero',
      heading: {
        text: msg`Grow with a flexible foundation`,
        fontFamily: 'sans',
      },
      body: {
        text: msg`NetZero runs a modular Twenty setup across carbon credits, ag products, and industrial systems.`,
      },
      illustration: 'money',
      href: '/customers/netzero',
    },
  ],
};
