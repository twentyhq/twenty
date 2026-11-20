import { msg } from '@lingui/core/macro';

import { type ProgramStep } from './program-step.type';

export const INTEGRATOR_STEPS: readonly ProgramStep[] = [
  {
    title: msg`Apply`,
    body: msg`Tell us about your company, the clients you work with and what you have built with Twenty. It takes a few minutes.`,
    visual: { kind: 'form' },
  },
  {
    title: msg`Get your partner code`,
    body: msg`We review every application by hand, then send you your partner code.`,
    visual: { kind: 'ticket', label: msg`Partner code`, value: 'TWENTY-7F3K' },
  },
  {
    title: msg`Bring your clients`,
    body: msg`Earn 20% of seat revenue for 12 months on every client on Organization or Enterprise.`,
    visual: {
      kind: 'earning',
      figure: msg`20%`,
      caption: msg`12 months`,
      trend: 'rising',
    },
  },
  {
    title: msg`Get help anytime`,
    body: msg`Ask our team and partners on the partner Discord.`,
    visual: { kind: 'discord' },
  },
];
