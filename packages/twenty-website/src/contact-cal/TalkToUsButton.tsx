'use client';

import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';

import { Button, type ButtonVariant } from '@/ui';

import { useContactCalModal } from './use-contact-cal-modal';

export function TalkToUsButton({
  label,
  variant,
}: {
  label: MessageDescriptor;
  variant?: ButtonVariant;
}) {
  const { i18n } = useLingui();
  const { openContactCalModal } = useContactCalModal();

  return (
    <Button
      label={i18n._(label)}
      variant={variant}
      onClick={openContactCalModal}
    />
  );
}
