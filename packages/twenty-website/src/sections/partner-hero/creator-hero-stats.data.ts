import { msg } from '@lingui/core/macro';

import { type PartnerHeroStat } from './partner-hero-stat.type';

export const CREATOR_HERO_STATS: readonly PartnerHeroStat[] = [
  { value: msg`20%`, label: msg`Of seat revenue` },
  { value: msg`12 months`, label: msg`Per customer` },
  { value: msg`30 days`, label: msg`Of credit per click` },
  { value: msg`$50`, label: msg`Minimum payout` },
];
