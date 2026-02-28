import { styled } from '@linaria/react';
import { type ComponentPropsWithoutRef, useContext } from 'react';

import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledIconContainerBase = styled.div<{ theme: ThemeType }>`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)};
`;

type StyledIconContainerProps = ComponentPropsWithoutRef<'div'>;

export const StyledIconContainer = (props: StyledIconContainerProps) => {
  const { theme } = useContext(ThemeContext);

  return <StyledIconContainerBase theme={theme} {...props} />;
};

export { StyledIconContainer as MenuItemIconBoxContainer };
