import { css } from '@linaria/core';
import Link from 'next/link';
import { type ReactNode } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from '@/tokens';

import { ButtonShape } from './button-shape';

const BUTTON_HEIGHT_PX: Record<ButtonSize, number> = {
  regular: 40,
  small: 32,
};

// Appearance is fully CSS-variable driven so a future surface scheme can
// restyle buttons by overriding variables, never by adding props.
const buttonClassName = css`
  --button-fill: transparent;
  --button-stroke: transparent;
  --button-hover-fill: transparent;
  --button-label: ${color('black')};
  --button-label-hover: ${color('black')};

  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  height: ${BUTTON_HEIGHT_PX.regular}px;
  justify-content: center;
  letter-spacing: 0;
  padding: 0 ${spacing(5)};
  position: relative;
  text-decoration: none;
  text-transform: uppercase;

  &[data-size='small'] {
    height: ${BUTTON_HEIGHT_PX.small}px;
    padding: 0 ${spacing(4)};
  }

  &[data-variant='filled'] {
    --button-fill: ${color('black')};
    --button-hover-fill: ${color('black-hover')};
    --button-label: ${color('white')};
    --button-label-hover: ${color('white')};
  }

  /* Dark surfaces invert via context, never via props. */
  [data-scheme='dark'] &[data-variant='filled'] {
    --button-fill: ${color('white')};
    --button-hover-fill: ${color('black')};
    --button-label: ${color('black')};
    --button-label-hover: ${color('white')};
  }

  [data-scheme='dark'] &[data-variant='outlined'] {
    /* Mirrors light outlined's 5% wash (the pricing-table toggle is the
       reference): white-5 over black, pre-composited to stay opaque. */
    --button-stroke: ${color('white')};
    --button-hover-fill: ${color('black-sheen')};
    --button-label: ${color('white')};
    --button-label-hover: ${color('white')};
  }

  &[data-variant='outlined'] {
    --button-stroke: ${color('black')};
    --button-hover-fill: ${color('black-5')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }

  [data-slot='hover-layer'] {
    --button-fill: var(--button-hover-fill);
    --button-stroke: transparent;

    /* Clip the sliding fill to the button's corner radius so trailing
       corners stay rounded mid-transition. */
    border-radius: ${radius(1)};
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    position: absolute;

    > span {
      display: block;
      height: 100%;
      position: relative;
      transform: translateX(calc(-100% - ${spacing(4)}));
      transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
      width: 100%;
    }
  }

  &:is(:hover, :focus-visible) [data-slot='hover-layer'] > span {
    transform: translateX(0);
  }

  @media (prefers-reduced-motion: reduce) {
    [data-slot='hover-layer'] > span {
      transition: none;
    }
  }

  &:is(:hover, :focus-visible) [data-slot='content'] {
    color: var(--button-label-hover);
  }

  [data-slot='content'] {
    align-items: center;
    color: var(--button-label);
    display: inline-flex;
    gap: ${spacing(2)};
    position: relative;
    transition: color 220ms ease;
  }
`;

export type ButtonSize = 'regular' | 'small';
export type ButtonVariant = 'filled' | 'outlined';

export type ButtonProps = {
  href?: string;
  label: string;
  leadingIcon?: ReactNode;
  size?: ButtonSize;
  type?: 'button' | 'submit';
  variant?: ButtonVariant;
  onClick?: () => void;
};

export function Button({
  href,
  label,
  leadingIcon,
  size = 'regular',
  type = 'button',
  variant = 'filled',
  onClick,
}: ButtonProps) {
  const heightPx = BUTTON_HEIGHT_PX[size];
  const isExternal = href !== undefined && !href.startsWith('/');

  const inner = (
    <>
      <ButtonShape heightPx={heightPx} outlined={variant === 'outlined'} />
      <span data-slot="hover-layer">
        <span>
          <ButtonShape heightPx={heightPx} />
        </span>
      </span>
      <span data-slot="content">
        {leadingIcon}
        {label}
      </span>
    </>
  );

  const sharedAttributes = {
    className: buttonClassName,
    'data-size': size,
    'data-variant': variant,
  };

  if (href === undefined) {
    return (
      <button {...sharedAttributes} onClick={onClick} type={type}>
        {inner}
      </button>
    );
  }

  if (isExternal) {
    return (
      <a
        {...sharedAttributes}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link {...sharedAttributes} href={href}>
      {inner}
    </Link>
  );
}
