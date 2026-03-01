import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { themeCssVariables } from '@ui/theme';

const StyledIconContainerBase = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[1]};
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
