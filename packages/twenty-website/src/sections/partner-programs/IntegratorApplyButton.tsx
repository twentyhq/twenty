'use client';

import { msg } from '@lingui/core/macro';

import { BecomePartnerButton } from '@/partner-application';

export function IntegratorApplyButton() {
  return <BecomePartnerButton label={msg`Apply as an integrator`} />;
}
