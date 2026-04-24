import type { HeroBaseDataType } from '@/sections/Hero/types';

const PRICING_HERO_SUBTAGLINE = {
  text: 'Start your free trial today\nwithout credit card.',
};

export const HERO_DATA = {
  heading: [
    { text: 'Simple', fontFamily: 'serif' },
    { text: 'Pricing', fontFamily: 'sans', newLine: true },
  ],
  body: PRICING_HERO_SUBTAGLINE,
} satisfies HeroBaseDataType;
