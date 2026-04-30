import { msg } from '@lingui/core/macro';
import type { SignoffDataType } from '@/sections/Signoff/types';

export const SIGNOFF_DATA: SignoffDataType = {
  heading: [
    { text: msg`Ready to grow\n`, fontFamily: 'serif' },
    { text: msg`with Twenty?`, fontFamily: 'sans' },
  ],
  body: {
    text: msg`Join our partner ecosystem and help businesses\ntake control of their CRM.`,
  },
};
