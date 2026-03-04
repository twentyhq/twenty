import { styled } from '@linaria/react';
import React from 'react';
import { themeCssVariables } from '@ui/theme-constants';

const StyledContent = styled.div<{
  isVerticalCentered?: boolean;
  isHorizontalCentered?: boolean;
  noPadding?: boolean;
  overflowHidden?: boolean;
  gap?: number;
  contentPadding?: number;
}>`
  align-items: ${({ isVerticalCentered }) =>
    isVerticalCentered ? 'center' : 'stretch'};
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  gap: ${({ gap }) =>
    gap !== undefined ? `var(--t-spacing-${gap})` : 'unset'};
  justify-content: ${({ isHorizontalCentered }) =>
    isHorizontalCentered ? 'center' : 'flex-start'};
  overflow: ${({ overflowHidden }) => (overflowHidden ? 'hidden' : 'visible')};
  padding: ${({ noPadding, contentPadding }) => {
    if (noPadding) return '0';
    if (contentPadding !== undefined)
      return `var(--t-spacing-${contentPadding})`;
    return themeCssVariables.spacing[10];
  }};
`;

export type ModalContentProps = React.PropsWithChildren & {
  isVerticalCentered?: boolean;
  isHorizontalCentered?: boolean;
  noPadding?: boolean;
  overflowHidden?: boolean;
  gap?: number;
  contentPadding?: number;
};

export const ModalContent = ({
  children,
  isVerticalCentered,
  isHorizontalCentered,
  noPadding,
  overflowHidden,
  gap,
  contentPadding,
}: ModalContentProps) => (
  <StyledContent
    isVerticalCentered={isVerticalCentered}
    isHorizontalCentered={isHorizontalCentered}
    noPadding={noPadding}
    overflowHidden={overflowHidden}
    gap={gap}
    contentPadding={contentPadding}
  >
    {children}
  </StyledContent>
);
