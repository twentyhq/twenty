'use client';

import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';

import { Button, type ButtonVariant } from '@/ui';

import { usePartnerApplicationModal } from './use-partner-application-modal';

export function BecomePartnerButton({
  label,
  variant,
}: {
  label: MessageDescriptor;
  variant?: ButtonVariant;
}) {
  const { i18n } = useLingui();
  const { openPartnerApplicationModal } = usePartnerApplicationModal();

  return (
    <Button
      label={i18n._(label)}
      onClick={openPartnerApplicationModal}
      variant={variant}
    />
  );
}
