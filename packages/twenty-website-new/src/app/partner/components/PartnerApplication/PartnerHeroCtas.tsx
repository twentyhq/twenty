'use client';

import { LinkButton } from '@/design-system/components';

import { BecomePartnerButton } from './BecomePartnerButton';

export function PartnerHeroCtas() {
  return (
    <>
      <BecomePartnerButton />
      <LinkButton
        color="secondary"
        href="https://app.twenty.com/welcome"
        label="Find a partner"
        type="anchor"
        variant="contained"
      />
    </>
  );
}
