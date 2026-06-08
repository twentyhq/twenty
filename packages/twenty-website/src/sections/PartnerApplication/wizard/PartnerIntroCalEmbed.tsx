'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

import { PARTNER_INTRO_CAL_LINK } from '@/sections/PartnerApplication/config';

// Own namespace so the ui() config (hiding event-type details) applies only to
// this embed, not the ContactCal "talk to us" embed elsewhere on the site.
const PARTNER_INTRO_CAL_NAMESPACE = 'partner-intro';

type PartnerIntroCalEmbedProps = {
  name?: string;
  email?: string;
  notes?: string;
};

// Renders Cal.com's own booking UI in an iframe. We control the link, theme,
// month_view layout, and prefill via config; hideEventTypeDetails must go
// through ui() (it is not part of the config prop type). Cal owns the rest.
export function PartnerIntroCalEmbed({
  name,
  email,
  notes,
}: PartnerIntroCalEmbedProps) {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const cal = await getCalApi({ namespace: PARTNER_INTRO_CAL_NAMESPACE });
      if (cancelled) return;
      cal('ui', { hideEventTypeDetails: true });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Cal
      namespace={PARTNER_INTRO_CAL_NAMESPACE}
      calLink={PARTNER_INTRO_CAL_LINK}
      config={{
        theme: 'dark',
        layout: 'month_view',
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(notes !== undefined ? { notes } : {}),
      }}
      style={{ minHeight: 520, overflow: 'auto', width: '100%' }}
    />
  );
}
