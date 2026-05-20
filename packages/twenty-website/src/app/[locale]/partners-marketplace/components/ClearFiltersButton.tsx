'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { styled } from '@linaria/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const StyledClearFiltersButton = styled.button`
  ${buttonBaseStyles}
`;

type ClearFiltersButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  children: ReactNode;
};

export function ClearFiltersButton({
  children,
  type = 'button',
  ...buttonProps
}: ClearFiltersButtonProps) {
  return (
    <StyledClearFiltersButton
      {...buttonProps}
      data-color="secondary"
      data-size="small"
      data-variant="outlined"
      type={type}
    >
      <BaseButton
        color="secondary"
        label={children}
        size="small"
        variant="outlined"
      />
    </StyledClearFiltersButton>
  );
}
