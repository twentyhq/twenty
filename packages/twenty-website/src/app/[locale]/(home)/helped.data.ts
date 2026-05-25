import { msg } from '@lingui/core/macro';
import type { HeadingCardType } from '@/sections/Helped';

export const HELPED_CARDS: HeadingCardType[] = [
  {
    icon: 'w3villa',
    heading: msg`Ship a product on Twenty`,
    body: msg`W3villa built W3Grads for AI mock interviews at scale, with Twenty as the operational backbone.`,
    illustration: 'target',
    href: '/customers/w3villa',
  },
  {
    icon: 'act-education',
    heading: msg`Own your CRM end to end`,
    body: msg`AC&T replaced a shuttered vendor CRM with self-hosted Twenty and cut CRM costs by more than 90%.`,
    illustration: 'spaceship',
    href: '/customers/act-education',
  },
  {
    icon: 'netzero',
    heading: msg`Grow with a flexible foundation`,
    body: msg`NetZero runs a modular Twenty setup across carbon credits, ag products, and industrial systems.`,
    illustration: 'money',
    href: '/customers/netzero',
  },
];
