'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

// Renders Cal.com's own booking UI in an iframe. The contact form needs only
// the dark theme; the partner intro call adds its own namespace (so its ui()
// config is scoped), the month view, and prefill. hideEventTypeDetails must go
// through ui() — it is not part of the config prop — so it is applied only when
// a namespace is given.
export type CalEmbedProps = {
  calLink: string;
  layout?: 'month_view';
  namespace?: string;
  prefill?: { name?: string; email?: string; notes?: string };
};

export function CalEmbed({
  calLink,
  layout,
  namespace,
  prefill,
}: CalEmbedProps) {
  useEffect(() => {
    if (namespace === undefined) return;
    let cancelled = false;
    void (async () => {
      const cal = await getCalApi({ namespace });
      if (cancelled) return;
      cal('ui', { hideEventTypeDetails: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [namespace]);

  return (
    <Cal
      namespace={namespace}
      calLink={calLink}
      config={{
        theme: 'dark',
        ...(layout !== undefined ? { layout } : {}),
        ...prefill,
      }}
      style={{ minHeight: 520, overflow: 'auto', width: '100%' }}
    />
  );
}
