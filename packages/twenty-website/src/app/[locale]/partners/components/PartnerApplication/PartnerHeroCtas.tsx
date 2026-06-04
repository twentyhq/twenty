'use client';

import { LocalizedLinkButton } from '@/lib/i18n/LocalizedLink';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/core/macro';

import { BecomePartnerButton } from './BecomePartnerButton';

export function PartnerHeroCtas() {
  const { i18n } = useLingui();
  return (
    <>
      <BecomePartnerButton variant="contained" />
      <LocalizedLinkButton
        color="secondary"
        href="/partners/list"
        label={i18n._(msg`Find a partner`)}
        variant="outlined"
      />
    </>
  );
}
