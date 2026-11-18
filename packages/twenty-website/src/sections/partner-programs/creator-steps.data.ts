import { msg } from '@lingui/core/macro';

import { type ProgramStep } from './program-step.type';

export const CREATOR_STEPS: readonly ProgramStep[] = [
  {
    title: msg`Apply`,
    body: msg`We review every application within 5 business days and send your link once you're approved.`,
  },
  {
    title: msg`Share your link`,
    body: msg`Signups within 30 days of a click on your link are yours.`,
  },
  {
    title: msg`Earn 20% for 12 months`,
    body: msg`Of seat revenue on Cloud Organization and Enterprise plans, per customer, counted from their first payment.`,
  },
  {
    title: msg`Get paid monthly`,
    body: msg`From $50, after a 30-day hold.`,
  },
];
