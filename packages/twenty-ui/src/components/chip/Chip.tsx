import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';
import { themeCssVariables } from '@ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

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
  isBold?: boolean;
  maxWidth?: number;
  variant?: ChipVariant;
  accent?: ChipAccent;
  leftComponent?: ReactNode | null;
  rightComponent?: (() => ReactNode) | ReactNode | null;
  rightComponentDivider?: boolean;
  className?: string;
  forceEmptyText?: boolean;
  emptyLabel?: string;
};

const StyledDiv = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledContainer = styled.div<
  Pick<
    ChipProps,
    | 'accent'
    | 'clickable'
    | 'disabled'
    | 'isBold'
    | 'maxWidth'
    | 'size'
    | 'variant'
  >
>`
  --chip-horizontal-padding: ${themeCssVariables.spacing[1]};
  --chip-vertical-padding: ${themeCssVariables.spacing[1]};

  text-decoration: none;
  align-items: center;

  color: ${({ accent, disabled }) =>
    disabled
      ? themeCssVariables.font.color.light
      : accent === ChipAccent.TextPrimary
        ? themeCssVariables.font.color.primary
        : themeCssVariables.font.color.secondary};

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
  gap: ${themeCssVariables.spacing[1]};
  height: ${({ size }) =>
    size === ChipSize.Large
      ? themeCssVariables.spacing[4]
      : themeCssVariables.spacing[3]};
  max-width: ${({ maxWidth }) =>
    maxWidth
      ? `calc(${maxWidth}px - 2 * var(--chip-horizontal-padding))`
      : '100%'};
  overflow: hidden;
  padding: var(--chip-vertical-padding) var(--chip-horizontal-padding);
  user-select: none;

  font-weight: ${({ accent, isBold }) =>
    isBold || accent === ChipAccent.TextSecondary
      ? themeCssVariables.font.weight.medium
      : 'inherit'};

  &:hover {
    background-color: ${({ variant, disabled, clickable }) =>
      variant === ChipVariant.Regular && !disabled && clickable
        ? themeCssVariables.background.transparent.light
        : variant === ChipVariant.Highlighted
          ? themeCssVariables.background.transparent.medium
          : variant === ChipVariant.Static
            ? themeCssVariables.background.transparent.light
            : 'inherit'};
  }

  &:active {
    background-color: ${({ disabled, variant, clickable }) =>
      variant === ChipVariant.Regular && !disabled && clickable
        ? themeCssVariables.background.transparent.medium
        : variant === ChipVariant.Highlighted
          ? themeCssVariables.background.transparent.strong
          : variant === ChipVariant.Static
            ? themeCssVariables.background.transparent.light
            : 'inherit'};
  }

  background-color: ${({ variant }) =>
    variant === ChipVariant.Highlighted || variant === ChipVariant.Static
      ? themeCssVariables.background.transparent.light
      : 'inherit'};

  border: none;

  border-radius: ${themeCssVariables.border.radius.sm};

  & > svg {
    flex-shrink: 0;
  }

  padding-left: ${({ variant }) =>
    variant === ChipVariant.Transparent
      ? themeCssVariables.spacing[0]
      : 'var(--chip-horizontal-padding)'};
`;

const StyledRightComponentDivider = styled.div`
  align-self: stretch;
  border-left: 1px solid ${themeCssVariables.border.color.light};
`;

const renderRightComponent = (
  rightComponent: (() => ReactNode) | ReactNode | null,
  rightComponentDivider?: boolean,
) => {
  if (!rightComponent) {
    return null;
  }

  const rendered =
    typeof rightComponent === 'function' ? rightComponent() : rightComponent;

  if (rightComponentDivider === true) {
    return (
      <>
        <StyledRightComponentDivider />
        {rendered}
      </>
    );
  }

  return rendered;
};

export const Chip = ({
  size = ChipSize.Small,
  label,
  isLabelHidden = false,
  isBold = false,
  disabled = false,
  clickable = true,
  variant = ChipVariant.Regular,
  leftComponent = null,
  rightComponent = null,
  rightComponentDivider = false,
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
      isBold={isBold}
      size={size}
      variant={variant}
      className={className}
      maxWidth={maxWidth}
    >
      {leftComponent}
      {!isLabelHidden && isDefined(label) && isNonEmptyString(label) ? (
        <OverflowingTextWithTooltip size={size} text={label} />
      ) : !forceEmptyText && !isLabelHidden ? (
        <StyledDiv>{emptyLabel}</StyledDiv>
      ) : (
        ''
      )}
      {renderRightComponent(rightComponent, rightComponentDivider)}
    </StyledContainer>
  );
};
