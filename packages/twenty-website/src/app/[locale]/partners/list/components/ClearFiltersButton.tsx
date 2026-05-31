'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { styled } from '@linaria/react';
import type { MouseEventHandler, ReactNode } from 'react';

const StyledClearFiltersButton = styled.button`
  ${buttonBaseStyles}
`;

type ClearFiltersButtonProps = {
  children: ReactNode;
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function ClearFiltersButton({
  children,
  className,
  onClick,
}: ClearFiltersButtonProps) {
  return (
    <StyledClearFiltersButton
      className={className}
      data-color="secondary"
      data-size="small"
      data-variant="outlined"
      onClick={onClick}
      type="button"
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
