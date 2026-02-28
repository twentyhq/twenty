import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledIconContainerBase = styled.div<{ theme: ThemeType }>`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const StyledIconContainer = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledIconContainerBase theme={theme} className={className}>
      {children}
    </StyledIconContainerBase>
  );
};

export { StyledIconContainer as MenuItemIconBoxContainer };
