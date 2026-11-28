'use client';

import { msg } from '@lingui/core/macro';

import { AffiliateApplyButton } from '@/affiliate-application';
import { type ButtonVariant } from '@/ui';

type CreatorApplyButtonProps = {
  variant?: ButtonVariant;
};

export function CreatorApplyButton({ variant }: CreatorApplyButtonProps) {
  return (
    <AffiliateApplyButton label={msg`Apply as a creator`} variant={variant} />
  );
}
