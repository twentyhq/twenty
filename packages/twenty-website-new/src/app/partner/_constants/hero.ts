import type { HeroBaseDataType } from '@/sections/Hero/types';

export const HERO_DATA = {
  heading: [
    { text: 'Become a ', fontFamily: 'serif' },
    { text: 'Twenty Partner', fontFamily: 'sans', newLine: true },
  ],
  body: {
    text: "We're building the #1 open-source CRM, but we can't do it alone. Join our partner ecosystem and grow with us.",
  },
} satisfies HeroBaseDataType;
