import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

type CreatorStep = {
  title: MessageDescriptor;
  body: MessageDescriptor;
};

// PROTOTYPE same steps and strings as sections/partner-programs.
export const CREATOR_STEPS: readonly CreatorStep[] = [
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
