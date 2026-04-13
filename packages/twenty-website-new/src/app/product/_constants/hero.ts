import type { HeroBaseDataType } from '@/sections/Hero/types';

export const HERO_DATA = {
  heading: [
    { text: 'The CRM that moves ', fontFamily: 'serif' },
    { text: 'as fast as you do', fontFamily: 'sans' },
  ],
  body: {
    text: 'Modern interface. AI assistance. All the features you need, ready from day one.',
  },
} satisfies HeroBaseDataType;
