import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconBook,
  IconBriefcase,
  IconMessage,
  IconPercentage,
  IconUserCircle,
} from '@tabler/icons-react';

import { type IconComponent } from '@/icons';

export type PartnerLevelPerk = {
  icon: IconComponent;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export type PartnerLevel = {
  label: MessageDescriptor;
  title: MessageDescriptor;
  tagline: MessageDescriptor;
  headline: MessageDescriptor;
  headlineSuffix?: MessageDescriptor;
  perksIntro: MessageDescriptor;
  perks: readonly PartnerLevelPerk[];
  // Levels without one are open to apply and take the section's action.
  requirement?: MessageDescriptor;
};

export const PARTNER_LEVELS: readonly PartnerLevel[] = [
  {
    label: msg`Level 01`,
    title: msg`Integrator`,
    tagline: msg`You implement Twenty for clients you bring yourself.`,
    headline: msg`20%`,
    headlineSuffix: msg`of seat revenue`,
    perksIntro: msg`Includes`,
    perks: [
      {
        icon: IconPercentage,
        title: msg`20% on every client you bring`,
        description: msg`Seat revenue on Organization or Enterprise, for 12 months`,
      },
      {
        icon: IconMessage,
        title: msg`Partner Discord`,
        description: msg`Help from our team and other partners`,
      },
      {
        icon: IconBook,
        title: msg`Partner training`,
        description: msg`Coming soon`,
      },
    ],
  },
  {
    label: msg`Level 02`,
    title: msg`Lead Integrator`,
    tagline: msg`An integrator we trust with our own leads.`,
    headline: msg`+ Client briefs`,
    perksIntro: msg`Everything in Integrator, plus`,
    perks: [
      {
        icon: IconBriefcase,
        title: msg`Client briefs`,
        description: msg`From companies looking for a Twenty partner`,
      },
      {
        icon: IconUserCircle,
        title: msg`A directory profile`,
        description: msg`Listed in the Twenty partner directory`,
      },
      {
        icon: IconPercentage,
        title: msg`20% on the clients you bring yourself`,
        description: msg`Clients from briefs do not earn a commission`,
      },
    ],
    requirement: msg`For partners with extensive experience implementing Twenty`,
  },
];
