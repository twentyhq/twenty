'use client';

import { styled } from '@linaria/react';
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '../preview-font-size';

export type ChipVariant =
  | 'highlighted'
  | 'regular'
  | 'transparent'
  | 'rounded'
  | 'static';

type ChipProps = {
  className?: string;
  clickable?: boolean;
  isBold?: boolean;
  label: string;
  leftComponent?: ReactNode;
  maxWidth?: number;
  onClick?: () => void;
  variant?: ChipVariant;
};

// Variant styling lives in data-attribute selectors (not prop functions) so
// every value bakes at build — twenty-ui's theme is tree-shaken out of the
// runtime bundle. Sized against the content box like twenty-front's chip:
// 12px content + 4px padding = 20px.
const StyledContainer = styled.div<{ $maxWidth?: number }>`
  --chip-horizontal-padding: ${THEME_LIGHT.spacing(1)};
  --chip-vertical-padding: ${THEME_LIGHT.spacing(1)};
  align-items: center;
  background-color: inherit;
  border: none;
  border-radius: ${THEME_LIGHT.border.radius.sm};
  box-sizing: content-box;
  color: ${THEME_LIGHT.font.color.primary};
  cursor: inherit;
  display: inline-flex;
  font-family: var(--font-product), sans-serif;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  gap: ${THEME_LIGHT.spacing(1)};
  height: ${THEME_LIGHT.spacing(3)};
  justify-content: flex-start;
  line-height: 1.4;
  max-width: ${({ $maxWidth }) =>
    $maxWidth
      ? `calc(${$maxWidth}px - 2 * var(--chip-horizontal-padding))`
      : '100%'};
  overflow: hidden;
  padding: var(--chip-vertical-padding) var(--chip-horizontal-padding);
  user-select: none;

  & > svg {
    flex-shrink: 0;
  }

  &[data-bold] {
    font-weight: ${THEME_LIGHT.font.weight.medium};
  }

  &[data-clickable] {
    cursor: pointer;
  }

  &[data-variant='highlighted'] {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }
  &[data-variant='highlighted']:hover {
    background-color: ${THEME_LIGHT.background.transparent.medium};
  }
  &[data-variant='highlighted']:active {
    background-color: ${THEME_LIGHT.background.transparent.strong};
  }

  &[data-variant='rounded'] {
    border-radius: ${THEME_LIGHT.border.radius.pill};
  }

  &[data-variant='static'] {
    background-color: ${THEME_LIGHT.background.transparent.lighter};
    border: 1px solid ${THEME_LIGHT.border.color.strong};
    border-radius: ${THEME_LIGHT.border.radius.pill};
    padding-left: ${THEME_LIGHT.spacing(2)};
    padding-right: ${THEME_LIGHT.spacing(2)};
  }
  &[data-variant='static']:hover,
  &[data-variant='static']:active {
    background-color: ${THEME_LIGHT.background.transparent.lighter};
  }

  &[data-variant='transparent'] {
    cursor: inherit;
    padding-left: 0;
  }

  &[data-clickable][data-variant='regular']:hover {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }
  &[data-clickable][data-variant='regular']:active {
    background-color: ${THEME_LIGHT.background.transparent.medium};
  }
`;

const StyledLabel = styled.span`
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function Chip({
  label,
  clickable = false,
  isBold = false,
  leftComponent = null,
  className,
  maxWidth,
  onClick,
  variant = 'regular',
}: ChipProps) {
  const isInteractive = clickable || onClick !== undefined;
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return;
    }
    event.stopPropagation();
  };
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return;
    }
    event.stopPropagation();
    onClick?.();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <StyledContainer
      $maxWidth={maxWidth}
      className={className}
      data-bold={isBold ? '' : undefined}
      data-clickable={isInteractive ? '' : undefined}
      data-variant={variant}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {leftComponent}
      <StyledLabel>{label}</StyledLabel>
    </StyledContainer>
  );
}
