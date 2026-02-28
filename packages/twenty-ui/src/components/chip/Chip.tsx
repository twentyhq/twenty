import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';
import { themeVar } from '@ui/theme';

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

const StyledDiv = styled.div`
  color: ${themeVar.font.color.tertiary};
`;

const StyledContainer = styled.div<
  Pick<
    ChipProps,
    'accent' | 'clickable' | 'disabled' | 'maxWidth' | 'size' | 'variant'
  >
>`
  --chip-horizontal-padding: ${themeVar.spacing[1]};
  --chip-vertical-padding: ${themeVar.spacing[1]};

  text-decoration: none;
  align-items: center;

  color: ${({ accent, disabled }) =>
    disabled
      ? themeVar.font.color.light
      : accent === ChipAccent.TextPrimary
        ? themeVar.font.color.primary
        : themeVar.font.color.secondary};

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
  gap: ${themeVar.spacing[1]};
  height: ${({ size }) =>
    size === ChipSize.Large ? themeVar.spacing[4] : themeVar.spacing[3]};
  max-width: ${({ maxWidth }) =>
    maxWidth
      ? `calc(${maxWidth}px - 2 * var(--chip-horizontal-padding))`
      : '100%'};
  overflow: hidden;
  padding: var(--chip-vertical-padding) var(--chip-horizontal-padding);
  user-select: none;

  font-weight: ${({ accent }) =>
    accent === ChipAccent.TextSecondary
      ? themeVar.font.weight.medium
      : 'inherit'};

  &:hover {
    background-color: ${({ variant, disabled }) =>
      variant === ChipVariant.Regular && !disabled
        ? themeVar.background.transparent.light
        : variant === ChipVariant.Highlighted
          ? themeVar.background.transparent.medium
          : variant === ChipVariant.Static
            ? themeVar.background.transparent.light
            : 'inherit'};
  }

  &:active {
    background-color: ${({ disabled, variant }) =>
      variant === ChipVariant.Regular && !disabled
        ? themeVar.background.transparent.medium
        : variant === ChipVariant.Highlighted
          ? themeVar.background.transparent.strong
          : variant === ChipVariant.Static
            ? themeVar.background.transparent.light
            : 'inherit'};
  }

  background-color: ${({ variant }) =>
    variant === ChipVariant.Highlighted || variant === ChipVariant.Static
      ? themeVar.background.transparent.light
      : 'inherit'};

  border: none;

  border-radius: ${themeVar.border.radius.sm};

  & > svg {
    flex-shrink: 0;
  }

  padding-left: ${({ variant }) =>
    variant === ChipVariant.Transparent
      ? themeVar.spacing[0]
      : 'var(--chip-horizontal-padding)'};
`;

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
