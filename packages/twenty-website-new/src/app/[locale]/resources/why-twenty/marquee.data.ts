import { msg } from '@lingui/core/macro';
import type { MarqueeDataType } from '@/sections/Marquee/types';

export const MARQUEE_DATA: MarqueeDataType = {
  heading: [
    { fontFamily: 'serif', text: msg`Same CRM` },
    { fontFamily: 'sans', text: msg`Same output` },
    { fontFamily: 'serif', text: msg`Same results` },
  ],
};
