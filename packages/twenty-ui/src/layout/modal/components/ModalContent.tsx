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
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  padding: ${({ noPadding, contentPadding }) => {
    if (noPadding) return '0';
    if (contentPadding !== undefined)
      return `var(--t-spacing-${contentPadding})`;
    return themeCssVariables.spacing[10];
  }};
  overflow: ${({ overflowHidden }) => (overflowHidden ? 'hidden' : 'visible')};
  gap: ${({ gap }) =>
    gap !== undefined ? `var(--t-spacing-${gap})` : 'unset'};
  align-items: ${({ isVerticalCentered }) =>
    isVerticalCentered ? 'center' : 'stretch'};
  justify-content: ${({ isHorizontalCentered }) =>
    isHorizontalCentered ? 'center' : 'flex-start'};
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
