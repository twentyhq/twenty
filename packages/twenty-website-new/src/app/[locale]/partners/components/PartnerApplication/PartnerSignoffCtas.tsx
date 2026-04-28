'use client';

import { TalkToUsButton } from '@/lib/contact-cal';

import { BecomePartnerButton } from './BecomePartnerButton';

export function PartnerSignoffCtas() {
  return (
    <>
      <BecomePartnerButton variant="outlined" />
      <TalkToUsButton
        color="secondary"
        label="Talk to us"
        variant="contained"
      />
    </>
  );
}
