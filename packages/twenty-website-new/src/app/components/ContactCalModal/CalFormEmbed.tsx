'use client';

import { CONTACT_CAL_FORM_CAL_LINK } from '@/app/_constants/contact-cal';
import Cal from '@calcom/embed-react';

export function CalFormEmbed() {
  return (
    <Cal
      calLink={CONTACT_CAL_FORM_CAL_LINK}
      config={{ theme: 'dark' }}
      style={{ minHeight: 520, overflow: 'auto', width: '100%' }}
    />
  );
}
