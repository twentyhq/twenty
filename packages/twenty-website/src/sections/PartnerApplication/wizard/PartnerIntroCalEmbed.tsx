'use client';

import Cal from '@calcom/embed-react';

import { PARTNER_INTRO_CAL_LINK } from '@/sections/PartnerApplication/config';

type PartnerIntroCalEmbedProps = {
  name?: string;
  email?: string;
  notes?: string;
};

// Renders Cal.com's own booking UI in an iframe. We only control the link,
// the light/dark theme, and the prefill — Cal owns the calendar internals.
export function PartnerIntroCalEmbed({
  name,
  email,
  notes,
}: PartnerIntroCalEmbedProps) {
  return (
    <Cal
      calLink={PARTNER_INTRO_CAL_LINK}
      config={{
        theme: 'dark',
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(notes !== undefined ? { notes } : {}),
      }}
      style={{ minHeight: 520, overflow: 'auto', width: '100%' }}
    />
  );
}
