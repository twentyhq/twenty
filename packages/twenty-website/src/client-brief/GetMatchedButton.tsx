'use client';

import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';

import { Button, type ButtonVariant } from '@/ui';

import { useClientBriefModal } from './use-client-brief-modal';

export function GetMatchedButton({
  label,
  partnerSlug,
  variant,
}: {
  label: MessageDescriptor;
  partnerSlug?: string;
  variant?: ButtonVariant;
}) {
  const { i18n } = useLingui();
  const { openClientBriefModal } = useClientBriefModal();

  return (
    <Button
      label={i18n._(label)}
      onClick={() => openClientBriefModal(partnerSlug)}
      variant={variant}
    />
  );
}
