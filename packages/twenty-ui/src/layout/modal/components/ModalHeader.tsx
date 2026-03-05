import { styled } from '@linaria/react';
import React from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from '@ui/theme-constants';

const StyledHeader = styled.div<{
  noPadding?: boolean;
  autoHeight?: boolean;
  hasBorderBottom?: boolean;
  paddingHorizontal?: number;
  backgroundColor?: string;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  height: ${({ autoHeight }) => (autoHeight ? 'auto' : '60px')};
  overflow: hidden;
  padding: ${({ noPadding, paddingHorizontal }) => {
    if (paddingHorizontal !== undefined)
      return `0 var(--t-spacing-${paddingHorizontal})`;
    if (noPadding === true) return '0';
    return themeCssVariables.spacing[5];
  }};
  background-color: ${({ backgroundColor }) => backgroundColor ?? 'unset'};
  border-bottom: ${({ hasBorderBottom }) =>
    hasBorderBottom
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    ${({ paddingHorizontal }) =>
      paddingHorizontal !== undefined
        ? `padding-left: ${themeCssVariables.spacing[4]}; padding-right: ${themeCssVariables.spacing[4]};`
        : ''}
  }
`;

export type ModalHeaderProps = React.PropsWithChildren & {
  noPadding?: boolean;
  autoHeight?: boolean;
  hasBorderBottom?: boolean;
  paddingHorizontal?: number;
  backgroundColor?: string;
};

export const ModalHeader = ({
  children,
  noPadding,
  autoHeight,
  hasBorderBottom,
  paddingHorizontal,
  backgroundColor,
}: ModalHeaderProps) => (
  <StyledHeader
    noPadding={noPadding}
    autoHeight={autoHeight}
    hasBorderBottom={hasBorderBottom}
    paddingHorizontal={paddingHorizontal}
    backgroundColor={backgroundColor}
  >
    {children}
  </StyledHeader>
);
