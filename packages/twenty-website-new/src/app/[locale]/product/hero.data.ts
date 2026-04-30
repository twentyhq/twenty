import { msg } from '@lingui/core/macro';
import type { HeroBaseDataType } from '@/sections/Hero/types';

export const HERO_DATA = {
  heading: [
    { text: msg`A CRM for teams`, fontFamily: 'serif' },
    { text: msg`that `, fontFamily: 'serif', newLine: true },
    { text: msg`moves fast`, fontFamily: 'sans' },
  ],
  body: {
    text: msg`Track relationships, manage pipelines, and take action quickly with a CRM that feels intuitive from day one.`,
  },
} satisfies HeroBaseDataType;
