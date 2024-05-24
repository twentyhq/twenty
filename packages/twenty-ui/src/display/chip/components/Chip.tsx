import { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import isPropValid from '@emotion/is-prop-valid';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

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
}

type ChipProps = {
  size?: ChipSize;
  disabled?: boolean;
  clickable?: boolean;
  label: string;
  maxWidth?: number;
  variant?: ChipVariant;
  accent?: ChipAccent;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  to?: string;
};

const StyledContainer = styled('div', {
  shouldForwardProp: (prop) =>
    !['clickable', 'maxWidth'].includes(prop) && isPropValid(prop),
})<
  Pick<
    ChipProps,
    'accent' | 'clickable' | 'disabled' | 'maxWidth' | 'size' | 'variant' | 'to'
  >
>`
  --chip-horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --chip-vertical-padding: ${({ theme }) => theme.spacing(1)};

  text-decoration: none;
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, disabled }) =>
    disabled ? theme.font.color.light : theme.font.color.secondary};
  cursor: ${({ clickable, disabled }) =>
    clickable ? 'pointer' : disabled ? 'not-allowed' : 'inherit'};
  display: inline-flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(3)};
  max-width: ${({ maxWidth }) =>
    maxWidth
      ? `calc(${maxWidth}px - 2 * var(--chip-horizontal-padding))`
      : '200px'};
  overflow: hidden;
  padding: var(--chip-vertical-padding) var(--chip-horizontal-padding);
  user-select: none;

  // Accent style overrides
  ${({ accent, disabled, theme }) => {
    if (accent === ChipAccent.TextPrimary) {
      return (
        !disabled &&
        css`
          color: ${theme.font.color.primary};
        `
      );
    }

    if (accent === ChipAccent.TextSecondary) {
      return css`
        font-weight: ${theme.font.weight.medium};
      `;
    }
  }}

  // Variant style overrides
  ${({ disabled, theme, variant }) => {
    if (variant === ChipVariant.Regular) {
      return (
        !disabled &&
        css`
          :hover {
            background-color: ${theme.background.transparent.light};
          }

          :active {
            background-color: ${theme.background.transparent.medium};
          }
        `
      );
    }

    if (variant === ChipVariant.Highlighted) {
      return css`
        background-color: ${theme.background.transparent.light};

        ${!disabled &&
        css`
          :hover {
            background-color: ${theme.background.transparent.medium};
          }

          :active {
            background-color: ${theme.background.transparent.strong};
          }
        `}
      `;
    }

    if (variant === ChipVariant.Rounded) {
      return css`
        --chip-horizontal-padding: ${theme.spacing(2)};
        --chip-vertical-padding: 3px;

        background-color: ${theme.background.transparent.lighter};
        border: 1px solid ${theme.border.color.medium};
        border-radius: 50px;
      `;
    }

    if (variant === ChipVariant.Transparent) {
      return css`
        cursor: inherit;
      `;
    }
  }}
`;

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledOverflowingTextWithTooltip = styled(OverflowingTextWithTooltip)<{
  size?: ChipSize;
}>`
  height: ${({ theme, size }) =>
    size === ChipSize.Large ? theme.spacing(4) : 'auto'};
`;

export const Chip = ({
  size = ChipSize.Small,
  label,
  disabled = false,
  clickable = true,
  variant = ChipVariant.Regular,
  leftComponent,
  rightComponent,
  accent = ChipAccent.TextPrimary,
  maxWidth,
  className,
  onClick,
  to,
}: ChipProps) => {
  return (
    <StyledContainer
      data-testid="chip"
      clickable={clickable}
      variant={variant}
      accent={accent}
      size={size}
      disabled={disabled}
      className={className}
      maxWidth={maxWidth}
      onClick={onClick}
      as={to ? Link : 'div'}
      to={to ? to : undefined}
    >
      {leftComponent}
      <StyledLabel>
        <StyledOverflowingTextWithTooltip size={size} text={label} />
      </StyledLabel>
      {rightComponent}
    </StyledContainer>
  );
};
