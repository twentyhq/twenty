import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { theme } from '@ui/theme';

const StyledIconContainerBase = styled.div`
  align-items: flex-start;
  background: ${theme.background.transparent.light};
  border-radius: ${theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing[1]};
`;

export const StyledIconContainer = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <StyledIconContainerBase className={className}>
      {children}
    </StyledIconContainerBase>
  );
};

export { StyledIconContainer as MenuItemIconBoxContainer };
