'use client';

import { TalkToUsButton } from '@/app/components/ContactCalModal';

import { BecomePartnerButton } from './BecomePartnerButton';

export function PartnerHeroCtas() {
  return (
    <>
      <BecomePartnerButton variant="contained" />
      <TalkToUsButton
        color="secondary"
        label="Find a partner"
        variant="outlined"
      />
    </>
  );
}
