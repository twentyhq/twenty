'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { styled } from '@linaria/react';

import { useContactCalModal } from './ContactCalModalRoot';

const StyledTrigger = styled.button`
  ${buttonBaseStyles}
`;

type TalkToUsButtonProps = {
  color: 'primary' | 'secondary';
  label: string;
  variant: 'contained' | 'outlined';
};

export function TalkToUsButton({ color, label, variant }: TalkToUsButtonProps) {
  const { openContactCalModal } = useContactCalModal();

  return (
    <StyledTrigger type="button" onClick={openContactCalModal}>
      <BaseButton color={color} label={label} variant={variant} />
    </StyledTrigger>
  );
}
