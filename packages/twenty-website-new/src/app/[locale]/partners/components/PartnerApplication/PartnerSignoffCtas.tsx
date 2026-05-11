'use client';

import { TalkToUsButton } from '@/sections/ContactCal';
import { msg } from '@lingui/core/macro';

import { BecomePartnerButton } from './BecomePartnerButton';

export function PartnerSignoffCtas() {
  return (
    <>
      <BecomePartnerButton variant="outlined" />
      <TalkToUsButton
        color="secondary"
        label={msg`Talk to us`}
        variant="contained"
      />
    </>
  );
}
