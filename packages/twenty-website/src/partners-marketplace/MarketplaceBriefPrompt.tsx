'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { Button, EngagementBand } from '@/ui';

export function MarketplaceBriefPrompt() {
  const { i18n } = useLingui();

  return (
    <EngagementBand
      rhythm="section"
      heading={i18n._(msg`Didn't find the *right partner*?`)}
      body={i18n._(
        msg`Tell us what you need and we'll match you with a certified Twenty partner.`,
      )}
      actions={
        <Button href="/partners/brief" label={i18n._(msg`Submit a brief`)} />
      }
    />
  );
}
