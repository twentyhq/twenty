'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { useLingui } from '@lingui/react';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';

import { useContactCalModal } from './ContactCalModalRoot';

const StyledTrigger = styled.button`
  ${buttonBaseStyles}
`;

type TalkToUsButtonProps = {
  color: 'primary' | 'secondary';
  label: MessageDescriptor;
  variant: 'contained' | 'outlined';
};

export function TalkToUsButton({ color, label, variant }: TalkToUsButtonProps) {
  const { i18n } = useLingui();
  const { openContactCalModal } = useContactCalModal();

  return (
    <StyledTrigger
      data-color={color}
      data-variant={variant}
      type="button"
      onClick={openContactCalModal}
    >
      <BaseButton color={color} label={i18n._(label)} variant={variant} />
    </StyledTrigger>
  );
}
