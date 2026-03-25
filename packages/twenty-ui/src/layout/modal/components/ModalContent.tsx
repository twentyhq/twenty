import { styled } from '@linaria/react';
import React from 'react';
import { themeCssVariables } from '@ui/theme-constants';

const StyledContent = styled.div<{
  isVerticallyCentered?: boolean;
  isHorizontallyCentered?: boolean;
  noPadding?: boolean;
  overflowHidden?: boolean;
  gap?: number;
  contentPadding?: number;
}>`
  align-items: ${({ isVerticallyCentered }) =>
    isVerticallyCentered ? 'center' : 'stretch'};
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  gap: ${({ gap }) =>
    gap !== undefined ? `var(--t-spacing-${gap})` : 'unset'};
  justify-content: ${({ isHorizontallyCentered }) =>
    isHorizontallyCentered ? 'center' : 'flex-start'};
  overflow: ${({ overflowHidden }) => (overflowHidden ? 'hidden' : 'visible')};
  padding: ${({ noPadding, contentPadding }) => {
    if (noPadding === true) return '0';
    if (contentPadding !== undefined)
      return `var(--t-spacing-${contentPadding})`;
    return themeCssVariables.spacing[10];
  }};
`;

export type ModalContentProps = React.PropsWithChildren & {
  isVerticallyCentered?: boolean;
  isHorizontallyCentered?: boolean;
  noPadding?: boolean;
  overflowHidden?: boolean;
  gap?: number;
  contentPadding?: number;
};

export const ModalContent = ({
  children,
  isVerticallyCentered,
  isHorizontallyCentered,
  noPadding,
  overflowHidden,
  gap,
  contentPadding,
}: ModalContentProps) => (
  <StyledContent
    isVerticallyCentered={isVerticallyCentered}
    isHorizontallyCentered={isHorizontallyCentered}
    noPadding={noPadding}
    overflowHidden={overflowHidden}
    gap={gap}
    contentPadding={contentPadding}
  >
    {children}
  </StyledContent>
);
