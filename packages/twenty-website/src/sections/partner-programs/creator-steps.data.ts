import { msg } from '@lingui/core/macro';

import { type ProgramStep } from './program-step.type';

export const CREATOR_STEPS: readonly ProgramStep[] = [
  {
    title: msg`20% commission`,
    body: msg`Of seat revenue on Cloud Organization and Enterprise plans.`,
  },
  {
    title: msg`For 12 months`,
    body: msg`Per customer, counted from their first payment.`,
  },
  {
    title: msg`30 days of credit`,
    body: msg`Signups within 30 days of a click on your link are yours.`,
  },
  {
    title: msg`Monthly payouts`,
    body: msg`From $50, after a 30-day hold.`,
  },
];
