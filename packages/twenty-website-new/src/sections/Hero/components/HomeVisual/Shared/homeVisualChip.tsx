import { styled } from '@linaria/react';
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { VISUAL_TOKENS } from './homeVisualTokens';

export enum ChipVariant {
  Highlighted = 'highlighted',
  Regular = 'regular',
  Transparent = 'transparent',
  Rounded = 'rounded',
  Static = 'static',
}

export type ChipProps = {
  label: string;
  clickable?: boolean;
  isBold?: boolean;
  leftComponent?: ReactNode | null;
  className?: string;
  maxWidth?: number;
  onClick?: () => void;
  variant?: ChipVariant;
};

const StyledContainer = styled.div<
  Pick<ChipProps, 'clickable' | 'isBold' | 'maxWidth' | 'variant'>
>`
  --chip-horizontal-padding: ${VISUAL_TOKENS.spacing[1]};
  --chip-vertical-padding: 3px;

  align-items: center;
  background-color: ${({ variant }) =>
    variant === ChipVariant.Static
      ? VISUAL_TOKENS.background.transparent.lighter
      : variant === ChipVariant.Highlighted
        ? VISUAL_TOKENS.background.transparent.light
        : 'inherit'};
  border: ${({ variant }) =>
    variant === ChipVariant.Static
      ? `1px solid ${VISUAL_TOKENS.border.color.strong}`
      : 'none'};
  border-radius: ${({ variant }) =>
    variant === ChipVariant.Rounded || variant === ChipVariant.Static
      ? VISUAL_TOKENS.border.radius.pill
      : VISUAL_TOKENS.border.radius.sm};
  color: ${VISUAL_TOKENS.font.color.primary};
  cursor: ${({ clickable, variant }) =>
    variant === ChipVariant.Transparent
      ? 'inherit'
      : clickable
        ? 'pointer'
        : 'inherit'};
  display: inline-flex;
  gap: ${VISUAL_TOKENS.spacing[1]};
  height: 20px;
  justify-content: flex-start;
  max-width: ${({ maxWidth }) =>
    maxWidth
      ? `calc(${maxWidth}px - 2 * var(--chip-horizontal-padding))`
      : '100%'};
  overflow: hidden;
  padding: var(--chip-vertical-padding) var(--chip-horizontal-padding);
  padding-left: ${({ variant }) =>
    variant === ChipVariant.Transparent
      ? VISUAL_TOKENS.spacing[0]
      : variant === ChipVariant.Static
        ? VISUAL_TOKENS.spacing[2]
        : 'var(--chip-horizontal-padding)'};
  padding-right: ${({ variant }) =>
    variant === ChipVariant.Static
      ? VISUAL_TOKENS.spacing[2]
      : 'var(--chip-horizontal-padding)'};
  user-select: none;
  font-family: ${VISUAL_TOKENS.font.family};
  font-size: ${VISUAL_TOKENS.font.size.md};
  line-height: 1.4;

  font-weight: ${({ isBold }) =>
    isBold
      ? VISUAL_TOKENS.font.weight.medium
      : VISUAL_TOKENS.font.weight.regular};

  &:hover {
    background-color: ${({ variant }) =>
      variant === ChipVariant.Regular
        ? VISUAL_TOKENS.background.transparent.light
        : variant === ChipVariant.Highlighted
          ? VISUAL_TOKENS.background.transparent.medium
          : variant === ChipVariant.Static
            ? VISUAL_TOKENS.background.transparent.lighter
            : 'inherit'};
  }

  &:active {
    background-color: ${({ variant }) =>
      variant === ChipVariant.Regular
        ? VISUAL_TOKENS.background.transparent.medium
        : variant === ChipVariant.Highlighted
          ? VISUAL_TOKENS.background.transparent.strong
          : variant === ChipVariant.Static
            ? VISUAL_TOKENS.background.transparent.lighter
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

export const Chip = ({
  label,
  clickable = false,
  isBold = false,
  leftComponent = null,
  className,
  maxWidth,
  onClick,
  variant = ChipVariant.Regular,
}: ChipProps) => {
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
      clickable={isInteractive}
      isBold={isBold}
      variant={variant}
      className={className}
      maxWidth={maxWidth}
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
};
