import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { type ReactNode, useContext } from 'react';

const StyledCard = styled.div<{
  fullWidth?: boolean;
  rounded?: boolean;
  theme: ThemeType;
}>`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme, rounded }) =>
    rounded ? theme.border.radius.md : theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  overflow: hidden;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export const Card = ({
  children,
  className,
  fullWidth,
  rounded,
}: {
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  rounded?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledCard
      theme={theme}
      className={className}
      fullWidth={fullWidth}
      rounded={rounded}
    >
      {children}
    </StyledCard>
  );
};
