'use client';

import { TalkToUsButton } from '@/app/components/ContactCalModal';

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
