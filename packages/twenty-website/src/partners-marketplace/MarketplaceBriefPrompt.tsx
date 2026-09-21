'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { type ReactNode } from 'react';

import { EngagementBand } from '@/ui';

export function MarketplaceBriefPrompt({ cta }: { cta: ReactNode }) {
  const { i18n } = useLingui();

  return (
    <EngagementBand
      rhythm="section"
      heading={i18n._(msg`Didn't find the *right partner*?`)}
      body={i18n._(
        msg`Tell us what you need and we'll match you with a certified Twenty partner.`,
      )}
      actions={cta}
    />
  );
}
