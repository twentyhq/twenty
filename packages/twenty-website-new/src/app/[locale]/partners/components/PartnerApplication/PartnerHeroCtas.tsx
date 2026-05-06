'use client';

import { TalkToUsButton } from '@/lib/contact-cal';
import { msg } from '@lingui/core/macro';

import { BecomePartnerButton } from './BecomePartnerButton';

export function PartnerHeroCtas() {
  return (
    <>
      <BecomePartnerButton variant="contained" />
      <TalkToUsButton
        color="secondary"
        label={msg`Find a partner`}
        variant="outlined"
      />
    </>
  );
}
