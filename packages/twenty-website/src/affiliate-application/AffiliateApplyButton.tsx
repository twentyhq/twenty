'use client';

import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';

import { Button, type ButtonVariant } from '@/ui';

import { useAffiliateApplicationModal } from './use-affiliate-application-modal';

export function AffiliateApplyButton({
  label,
  variant,
}: {
  label: MessageDescriptor;
  variant?: ButtonVariant;
}) {
  const { i18n } = useLingui();
  const { openAffiliateApplicationModal } = useAffiliateApplicationModal();

  return (
    <Button
      label={i18n._(label)}
      onClick={openAffiliateApplicationModal}
      variant={variant}
    />
  );
}
