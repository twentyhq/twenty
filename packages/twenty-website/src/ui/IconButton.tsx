import { css } from '@linaria/core';
import { type CSSProperties, type ReactNode } from 'react';

import { color, radius, semanticColor } from '@/tokens';

const iconButtonClassName = css`
  align-items: center;
  background: none;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  cursor: pointer;
  display: inline-flex;
  height: var(--icon-button-size, 40px);
  justify-content: center;
  width: var(--icon-button-size, 40px);

  /* The disabled glyph rides the scheme's strong line tone (its 20% value):
     identical black-20 on light surfaces, the matching white-20 on dark ones,
     so a disabled arrow stays faintly legible on a dark panel instead of
     vanishing into it. */
  &:disabled {
    border-color: ${semanticColor.line};
    color: ${semanticColor.lineStrong};
    cursor: default;
  }

  &:disabled:hover {
    background-color: transparent;
  }

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
  disabled?: boolean;
  sizePx?: number;
  onClick?: () => void;
};

export function IconButton({
  ariaLabel,
  children,
  disabled = false,
  sizePx = 40,
  onClick,
}: IconButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={iconButtonClassName}
      disabled={disabled}
      onClick={onClick}
      style={{ '--icon-button-size': `${sizePx}px` } as CSSProperties}
      type="button"
    >
      {children}
    </button>
  );
}
