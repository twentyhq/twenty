import { msg } from '@lingui/core/macro';
import type { HeroBaseDataType } from '@/sections/Hero/types';

const PRICING_HERO_SUBTAGLINE = {
  text: msg`Start your free trial today\nwithout credit card.`,
};

export const HERO_DATA = {
  heading: [
    { text: msg`Simple`, fontFamily: 'serif' },
    { text: msg`Pricing`, fontFamily: 'sans', newLine: true },
  ],
  body: PRICING_HERO_SUBTAGLINE,
} satisfies HeroBaseDataType;
