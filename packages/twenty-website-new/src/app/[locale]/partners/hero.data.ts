import { msg } from '@lingui/core/macro';
import type { HeroBaseDataType } from '@/sections/Hero/types';

export const HERO_DATA = {
  heading: [
    { text: msg`Become `, fontFamily: 'serif' },
    { text: msg`our partner`, fontFamily: 'sans', newLine: true },
  ],
  body: {
    text: msg`We're building the #1 open source CRM, but we can't do it alone. Join our partner ecosystem and grow with us.`,
  },
} satisfies HeroBaseDataType;
