'use client';

import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { AffiliateApplyButton } from '@/affiliate-application';
import { type ButtonVariant } from '@/ui';

// Marks the page's apply buttons so the dock knows when one is on screen.
const ApplyAnchor = styled.span`
  display: inline-flex;
`;

type CreatorApplyButtonProps = {
  // The dock's own button must not count as an on-page apply anchor.
  isDocked?: boolean;
  variant?: ButtonVariant;
};

export function CreatorApplyButton({
  isDocked = false,
  variant,
}: CreatorApplyButtonProps) {
  return (
    <ApplyAnchor data-dock-anchor={isDocked ? undefined : ''}>
      <AffiliateApplyButton label={msg`Apply as a creator`} variant={variant} />
    </ApplyAnchor>
  );
}
