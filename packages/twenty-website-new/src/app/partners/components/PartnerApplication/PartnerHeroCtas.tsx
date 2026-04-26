'use client';

import { TalkToUsButton } from '@/lib/contact-cal';

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
