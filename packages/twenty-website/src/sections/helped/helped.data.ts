import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Which halftone model fills the card's stage when the visual-runtime
// wave lands (target / spaceship / money GLBs).
export type HelpedVisualId = 'target' | 'spaceship' | 'money';

export type HelpedCardRecord = {
  body: MessageDescriptor;
  heading: MessageDescriptor;
  href: string;
  illustration: HelpedVisualId;
  wordmark: string;
};

export const HELPED_CARDS: readonly HelpedCardRecord[] = [
  {
    wordmark: 'W3villa',
    heading: msg`Ship a product on Twenty`,
    body: msg`W3villa built W3Grads for AI mock interviews at scale, with Twenty as the operational backbone.`,
    illustration: 'target',
    href: '/customers/w3villa',
  },
  {
    wordmark: 'AC&T',
    heading: msg`Own your CRM end to end`,
    body: msg`AC&T replaced a shuttered vendor CRM with self-hosted Twenty and cut CRM costs by more than 90%.`,
    illustration: 'spaceship',
    href: '/customers/act-education',
  },
  {
    wordmark: 'NetZero',
    heading: msg`Grow with a flexible foundation`,
    body: msg`NetZero runs a modular Twenty setup across carbon credits, ag products, and industrial systems.`,
    illustration: 'money',
    href: '/customers/netzero',
  },
];
