import { css } from '@linaria/core';
import { type ReactNode } from 'react';

import { color, radius, semanticColor } from '@/tokens';

const iconButtonClassName = css`
  align-items: center;
  background: none;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  cursor: pointer;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;

  &:hover {
    background-color: ${color('black-5')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

export type IconButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  onClick?: () => void;
};

export function IconButton({ ariaLabel, children, onClick }: IconButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={iconButtonClassName}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
