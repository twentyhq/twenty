import type { HeroBaseDataType } from '@/sections/Hero/types';

export const HERO_DATA = {
  heading: [
    { text: 'A CRM for teams', fontFamily: 'serif' },
    { text: 'that ', fontFamily: 'serif', newLine: true },
    { text: 'moves fast', fontFamily: 'sans' },
  ],
  body: {
    text: 'Track relationships, manage pipelines, and take action quickly with a CRM that feels intuitive from day one.',
  },
} satisfies HeroBaseDataType;
