'use client';

import { styled } from '@linaria/react';
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

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

const theme = APP_PREVIEW_THEME;

const StyledContainer = styled.div<
  Pick<ChipProps, 'clickable' | 'isBold' | 'maxWidth' | 'variant'>
>`
  --chip-horizontal-padding: ${theme.spacingBasePx}px;
  --chip-vertical-padding: 3px;
  align-items: center;
  background-color: ${({ variant }) =>
    variant === 'static'
      ? theme.background.transparent.lighter
      : variant === 'highlighted'
        ? theme.background.transparent.light
        : 'inherit'};
  border: ${({ variant }) =>
    variant === 'static' ? `1px solid ${theme.border.color.strong}` : 'none'};
  border-radius: ${({ variant }) =>
    variant === 'rounded' || variant === 'static'
      ? theme.border.radius.pill
      : theme.border.radius.sm};
  color: ${theme.font.color.primary};
  cursor: ${({ clickable, variant }) =>
    variant === 'transparent' ? 'inherit' : clickable ? 'pointer' : 'inherit'};
  display: inline-flex;
  gap: ${theme.spacingBasePx}px;
  height: 20px;
  justify-content: flex-start;
  max-width: ${({ maxWidth }) =>
    maxWidth
      ? `calc(${maxWidth}px - 2 * var(--chip-horizontal-padding))`
      : '100%'};
  overflow: hidden;
  padding: var(--chip-vertical-padding) var(--chip-horizontal-padding);
  padding-left: ${({ variant }) =>
    variant === 'transparent'
      ? '0'
      : variant === 'static'
        ? `${theme.spacingBasePx * 2}px`
        : 'var(--chip-horizontal-padding)'};
  padding-right: ${({ variant }) =>
    variant === 'static'
      ? `${theme.spacingBasePx * 2}px`
      : 'var(--chip-horizontal-padding)'};
  user-select: none;
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
  line-height: 1.4;
  font-weight: ${({ isBold }) =>
    isBold ? theme.font.weight.medium : theme.font.weight.regular};

  &:hover {
    background-color: ${({ variant }) =>
      variant === 'regular'
        ? theme.background.transparent.light
        : variant === 'highlighted'
          ? theme.background.transparent.medium
          : variant === 'static'
            ? theme.background.transparent.lighter
            : 'inherit'};
  }

  &:active {
    background-color: ${({ variant }) =>
      variant === 'regular'
        ? theme.background.transparent.medium
        : variant === 'highlighted'
          ? theme.background.transparent.strong
          : variant === 'static'
            ? theme.background.transparent.lighter
            : 'inherit'};
  }

  & > svg {
    flex-shrink: 0;
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
      className={className}
      clickable={clickable}
      isBold={isBold}
      maxWidth={maxWidth}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      variant={variant}
    >
      {leftComponent}
      <StyledLabel>{label}</StyledLabel>
    </StyledContainer>
  );
}
