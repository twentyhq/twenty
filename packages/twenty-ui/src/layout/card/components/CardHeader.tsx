import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { type ReactNode, useContext } from 'react';

const StyledCardHeader = styled.div<{ theme: ThemeType }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

export const CardHeader = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledCardHeader theme={theme} className={className}>
      {children}
    </StyledCardHeader>
  );
};
