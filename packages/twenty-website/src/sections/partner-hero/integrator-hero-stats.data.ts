import { msg } from '@lingui/core/macro';

import { type PartnerHeroStat } from './partner-hero-stat.type';

export const INTEGRATOR_HERO_STATS: readonly PartnerHeroStat[] = [
  { value: msg`20%`, label: msg`Of seat revenue` },
  { value: msg`12 months`, label: msg`Per client you bring` },
  { value: msg`$0`, label: msg`To join` },
  { value: msg`3 steps`, label: msg`To get started` },
];
