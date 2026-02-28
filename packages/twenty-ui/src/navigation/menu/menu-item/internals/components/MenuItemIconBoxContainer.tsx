import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { themeVar } from '@ui/theme';

const StyledIconContainerBase = styled.div`
  align-items: flex-start;
  background: ${themeVar.background.transparent.light};
  border-radius: ${themeVar.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${themeVar.spacing[1]};
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
