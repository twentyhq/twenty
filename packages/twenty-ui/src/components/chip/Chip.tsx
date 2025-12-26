import { type Theme, withTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';

export enum ChipSize {
  Large = 'large',
  Small = 'small',
}

export enum ChipAccent {
  TextPrimary = 'text-primary',
  TextSecondary = 'text-secondary',
}

export enum ChipVariant {
  Highlighted = 'highlighted',
  Regular = 'regular',
  Transparent = 'transparent',
  Rounded = 'rounded',
  Static = 'static',
}

export type ChipProps = {
  size?: ChipSize;
  disabled?: boolean;
  clickable?: boolean;
  label: string;
  isLabelHidden?: boolean;
  maxWidth?: number;
  variant?: ChipVariant;
  accent?: ChipAccent;
  leftComponent?: ReactNode | null;
  rightComponent?: (() => ReactNode) | ReactNode | null;
  className?: string;
  forceEmptyText?: boolean;
  emptyLabel?: string;
};

const StyledDiv = withTheme(styled.div<{ theme: Theme }>`
  color: ${({ theme }) => theme.font.color.tertiary};
`);

const StyledContainer = withTheme(styled.div<
  Pick<
    ChipProps,
    'accent' | 'clickable' | 'disabled' | 'maxWidth' | 'size' | 'variant'
  > & { theme: Theme }
>`
  --chip-horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --chip-vertical-padding: ${({ theme }) => theme.spacing(1)};

  text-decoration: none;
  align-items: center;

  color: ${({ theme, accent, disabled }) =>
    disabled
      ? theme.font.color.light
      : accent === ChipAccent.TextPrimary
        ? theme.font.color.primary
        : theme.font.color.secondary};

  cursor: ${({ clickable, disabled, variant }) =>
    variant === ChipVariant.Transparent
      ? 'inherit'
      : clickable
        ? 'pointer'
        : disabled
          ? 'not-allowed'
          : 'inherit'};

  display: inline-flex;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme, size }) =>
    size === ChipSize.Large ? theme.spacing(4) : theme.spacing(3)};
  max-width: ${({ maxWidth }) =>
    maxWidth
      ? `calc(${maxWidth}px - 2 * var(--chip-horizontal-padding))`
      : '100%'};
  overflow: hidden;
  padding: var(--chip-vertical-padding) var(--chip-horizontal-padding);
  user-select: none;

  font-weight: ${({ theme, accent }) =>
    accent === ChipAccent.TextSecondary ? theme.font.weight.medium : 'inherit'};

  &:hover {
    background-color: ${({ theme, variant, disabled }) =>
      variant === ChipVariant.Regular && !disabled
        ? theme.background.transparent.light
        : variant === ChipVariant.Highlighted
          ? theme.background.transparent.medium
          : variant === ChipVariant.Static
            ? theme.background.transparent.light
            : 'inherit'};
  }

  &:active {
    background-color: ${({ theme, disabled, variant }) =>
      variant === ChipVariant.Regular && !disabled
        ? theme.background.transparent.medium
        : variant === ChipVariant.Highlighted
          ? theme.background.transparent.strong
          : variant === ChipVariant.Static
            ? theme.background.transparent.light
            : 'inherit'};
  }

  background-color: ${({ theme, variant }) =>
    variant === ChipVariant.Highlighted || variant === ChipVariant.Static
      ? theme.background.transparent.light
      : 'inherit'};

  border: none;

  border-radius: ${({ theme }) => theme.border.radius.sm};

  & > svg {
    flex-shrink: 0;
  }

  padding-left: ${({ theme, variant }) =>
    variant === ChipVariant.Transparent
      ? theme.spacing(0)
      : 'var(--chip-horizontal-padding)'};
`);

// TODO: refactor this
const renderRightComponent = (
  rightComponent: (() => ReactNode) | ReactNode | null,
) => {
  if (!rightComponent) {
    return null;
  }

  return typeof rightComponent === 'function'
    ? rightComponent()
    : rightComponent;
};

export const Chip = ({
  size = ChipSize.Small,
  label,
  isLabelHidden = false,
  disabled = false,
  clickable = true,
  variant = ChipVariant.Regular,
  leftComponent = null,
  rightComponent = null,
  accent = ChipAccent.TextPrimary,
  className,
  maxWidth,
  forceEmptyText = false,
  emptyLabel = 'Untitled',
}: ChipProps) => {
  return (
    <StyledContainer
      data-testid="chip"
      accent={accent}
      clickable={clickable}
      disabled={disabled}
      size={size}
      variant={variant}
      className={className}
      maxWidth={maxWidth}
    >
      {leftComponent}
      {!isLabelHidden && label && label.trim() ? (
        <OverflowingTextWithTooltip size={size} text={label} />
      ) : !forceEmptyText && !isLabelHidden ? (
        <StyledDiv>{emptyLabel}</StyledDiv>
      ) : (
        ''
      )}
      {renderRightComponent(rightComponent)}
    </StyledContainer>
  );
};
