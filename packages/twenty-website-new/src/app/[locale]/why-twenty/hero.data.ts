import { msg } from '@lingui/core/macro';
import type { HeroWhyTwentyDataType } from '@/sections/Hero/types';

export const HERO_DATA: HeroWhyTwentyDataType = {
  heading: [
    { text: msg`The future of CRM is built,`, fontFamily: 'serif' },
    { text: msg` not bought.`, fontFamily: 'sans' },
  ],
  body: {
    text:
      msg`CRM was a database you filled on Fridays. ` +
      'AI turned it into the system that runs your go-to-market. ' +
      "To differentiate, you have to build what your competitors can't buy.",
  },
};
