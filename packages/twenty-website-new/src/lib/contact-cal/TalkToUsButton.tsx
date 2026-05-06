'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
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
  const renderText = useRenderMessage();
  const { openContactCalModal } = useContactCalModal();

  return (
    <StyledTrigger
      data-color={color}
      data-variant={variant}
      type="button"
      onClick={openContactCalModal}
    >
      <BaseButton color={color} label={renderText(label)} variant={variant} />
    </StyledTrigger>
  );
}
