import { msg } from '@lingui/core/macro';
import type { SignoffDataType } from '@/sections/Signoff/types';

export const SIGNOFF_DATA: SignoffDataType = {
  heading: [
    { text: msg`Build a CRM your competitors `, fontFamily: 'serif' },
    { text: msg`can't buy.`, fontFamily: 'sans' },
  ],
  body: {
    text: msg`Open-source, AI-ready, and yours to shape.`,
  },
};
