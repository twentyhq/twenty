'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { styled } from '@linaria/react';

import { usePartnerApplicationModal } from './PartnerApplicationModalRoot';

const StyledTrigger = styled.button`
  ${buttonBaseStyles}
`;

type BecomePartnerButtonProps = {
  color?: 'primary' | 'secondary';
  variant?: 'contained' | 'outlined';
};

export function BecomePartnerButton({
  color = 'secondary',
  variant = 'contained',
}: BecomePartnerButtonProps) {
  const { openPartnerApplicationModal } = usePartnerApplicationModal();

  return (
    <StyledTrigger type="button" onClick={openPartnerApplicationModal}>
      <BaseButton
        color={color}
        label="Become a partner"
        variant={variant}
      />
    </StyledTrigger>
  );
}
