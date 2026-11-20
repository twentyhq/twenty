'use client';

import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { BecomePartnerButton } from '@/partner-application';

// Marks the page's apply buttons so the dock knows when one is on screen.
const ApplyAnchor = styled.span`
  display: inline-flex;
`;

type IntegratorApplyButtonProps = {
  // The dock's own button must not count as an on-page apply anchor.
  isDocked?: boolean;
};

// PROTOTYPE the existing apply button, tagged for the floating dock.
export function IntegratorApplyButton({
  isDocked = false,
}: IntegratorApplyButtonProps) {
  return (
    <ApplyAnchor data-integrator-apply={isDocked ? undefined : ''}>
      <BecomePartnerButton label={msg`Apply as an integrator`} />
    </ApplyAnchor>
  );
}
