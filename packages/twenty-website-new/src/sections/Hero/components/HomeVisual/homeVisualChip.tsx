import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

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
  variant?: ChipVariant;
};

const StyledContainer = styled.div<
  Pick<ChipProps, 'clickable' | 'isBold' | 'maxWidth' | 'variant'>
>`
  --chip-horizontal-padding: ${VISUAL_TOKENS.spacing[1]};
  --chip-vertical-padding: ${VISUAL_TOKENS.spacing[1]};

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
            ? VISUAL_TOKENS.background.transparent.light
            : 'inherit'};
  }

  &:active {
    background-color: ${({ variant }) =>
      variant === ChipVariant.Regular
        ? VISUAL_TOKENS.background.transparent.medium
        : variant === ChipVariant.Highlighted
          ? VISUAL_TOKENS.background.transparent.strong
          : variant === ChipVariant.Static
            ? VISUAL_TOKENS.background.transparent.light
            : 'inherit'};
  }

  & > svg {
    flex-shrink: 0;
  }
`;

const StyledLabel = styled.span`
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
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
  variant = ChipVariant.Regular,
}: ChipProps) => {
  return (
    <StyledContainer
      clickable={clickable}
      isBold={isBold}
      variant={variant}
      className={className}
      maxWidth={maxWidth}
    >
      {leftComponent}
      <StyledLabel>{label}</StyledLabel>
    </StyledContainer>
  );
};
