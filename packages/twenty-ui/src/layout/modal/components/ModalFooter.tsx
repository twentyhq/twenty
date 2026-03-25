import { styled } from '@linaria/react';
import React from 'react';
import { themeCssVariables } from '@ui/theme-constants';

const StyledFooter = styled.div<{
  autoHeight?: boolean;
  centered?: boolean;
  smallPadding?: boolean;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  height: ${({ autoHeight }) => (autoHeight ? 'auto' : '60px')};
  justify-content: ${({ centered }) => (centered ? 'center' : 'flex-end')};
  overflow: hidden;
  padding: ${({ smallPadding }) =>
    smallPadding ? themeCssVariables.spacing[3] : themeCssVariables.spacing[5]};
`;

export type ModalFooterProps = React.PropsWithChildren & {
  autoHeight?: boolean;
  centered?: boolean;
  smallPadding?: boolean;
  className?: string;
};

export const ModalFooter = ({
  children,
  autoHeight,
  centered,
  smallPadding,
  className,
}: ModalFooterProps) => (
  <StyledFooter
    autoHeight={autoHeight}
    centered={centered}
    smallPadding={smallPadding}
    className={className}
  >
    {children}
  </StyledFooter>
);
