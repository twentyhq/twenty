import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type ProgramStep = {
  title: MessageDescriptor;
  body: MessageDescriptor;
};

export const INTEGRATOR_STEPS: readonly ProgramStep[] = [
  {
    title: msg`Apply`,
    body: msg`Tell us about your company, the clients you work with and what you have built with Twenty.`,
  },
  {
    title: msg`Get your partner code`,
    body: msg`We review every application by hand, then send you your partner code.`,
  },
  {
    title: msg`Bring your clients`,
    body: msg`Earn 20% of seat revenue for 12 months on every client on Organization or Enterprise.`,
  },
  {
    title: msg`Get help when you need it`,
    body: msg`Ask our team and other partners on the partner Discord.`,
  },
];

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
