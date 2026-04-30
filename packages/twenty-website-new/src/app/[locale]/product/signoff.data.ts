import { msg } from '@lingui/core/macro';
import type { SignoffDataType } from '@/sections/Signoff/types';

export const SIGNOFF_DATA: SignoffDataType = {
  heading: [
    { text: msg`Ready to grow`, fontFamily: 'serif' },
    { text: msg`with `, fontFamily: 'serif', newLine: true },
    { text: msg`Twenty?`, fontFamily: 'sans' },
  ],
  body: {
    text: msg`Join the teams that chose to own their CRM. Start building with Twenty today.`,
  },
};
