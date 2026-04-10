'use client';

import { LinkButton } from '@/design-system/components';

import { BecomePartnerButton } from './BecomePartnerButton';

export function PartnerSignoffCtas() {
  return (
    <>
      <BecomePartnerButton />
      <LinkButton
        color="secondary"
        href="https://twenty.com/contact"
        label="Talk to us"
        type="anchor"
        variant="contained"
      />
    </>
  );
}
