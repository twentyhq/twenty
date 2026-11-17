import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type PartnerLevel = {
  title: MessageDescriptor;
  body: MessageDescriptor;
  perks: readonly MessageDescriptor[];
};

export const PARTNER_LEVELS: readonly PartnerLevel[] = [
  {
    title: msg`Integrator`,
    body: msg`You implement Twenty for clients you bring yourself.`,
    perks: [
      msg`20% of seat revenue for 12 months on every client you bring`,
      msg`Partner Discord: help from our team and other partners`,
      msg`Partner training, coming soon`,
    ],
  },
  {
    title: msg`Lead Integrator`,
    body: msg`Everything integrators get, once we have seen your work with clients.`,
    perks: [
      msg`Client briefs from companies looking for a Twenty partner`,
      msg`A profile in the Twenty partner directory`,
      msg`20% on the clients you bring yourself`,
    ],
  },
];
