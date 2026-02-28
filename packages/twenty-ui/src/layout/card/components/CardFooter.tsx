import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { type ReactNode, useContext } from 'react';

const StyledCardFooter = styled.div<{ divider?: boolean; theme: ThemeType }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-top: ${({ divider = true, theme }) =>
    divider ? `1px solid ${theme.border.color.medium}` : '0'};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

export const CardFooter = ({
  children,
  className,
  divider,
}: {
  children?: ReactNode;
  className?: string;
  divider?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledCardFooter theme={theme} className={className} divider={divider}>
      {children}
    </StyledCardFooter>
  );
};
