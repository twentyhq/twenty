'use client';

import Cal from '@calcom/embed-react';

import { CONTACT_CAL_FORM_CAL_LINK } from './contact-cal-config';

export function CalFormEmbed() {
  return (
    <Cal
      calLink={CONTACT_CAL_FORM_CAL_LINK}
      config={{ theme: 'dark' }}
      style={{ minHeight: 520, overflow: 'auto', width: '100%' }}
    />
  );
}
