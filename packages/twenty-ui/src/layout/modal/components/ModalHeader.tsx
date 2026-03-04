import { styled } from '@linaria/react';
import React from 'react';
import { themeCssVariables } from '@ui/theme-constants';

const StyledHeader = styled.div<{
  noPadding?: boolean;
  autoHeight?: boolean;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: ${({ autoHeight }) => (autoHeight ? 'auto' : '60px')};
  overflow: hidden;
  padding: ${({ noPadding }) =>
    noPadding ? '0' : themeCssVariables.spacing[5]};
`;

export type ModalHeaderProps = React.PropsWithChildren & {
  noPadding?: boolean;
  autoHeight?: boolean;
};

export const ModalHeader = ({
  children,
  noPadding,
  autoHeight,
}: ModalHeaderProps) => (
  <StyledHeader noPadding={noPadding} autoHeight={autoHeight}>
    {children}
  </StyledHeader>
);
