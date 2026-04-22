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
  label?: string;
  variant?: 'contained' | 'outlined';
};

export function BecomePartnerButton({
  color = 'secondary',
  label = 'Become a partner',
  variant = 'contained',
}: BecomePartnerButtonProps) {
  const { openPartnerApplicationModal } = usePartnerApplicationModal();

  return (
    <StyledTrigger
      data-color={color}
      data-variant={variant}
      type="button"
      onClick={() => {
        openPartnerApplicationModal();
      }}
    >
      <BaseButton color={color} label={label} variant={variant} />
    </StyledTrigger>
  );
}
