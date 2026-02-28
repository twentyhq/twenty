import { useContext } from 'react';
import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledRectangleIllustrationIcon = styled('div')<{ theme: ThemeType }>`
  background-color: ${({ theme }) => theme.background.primary};
  border: 0.75px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: center;
`;

export const IllustrationIconWrapper = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledRectangleIllustrationIcon theme={theme} className={className}>
      {children}
    </StyledRectangleIllustrationIcon>
  );
};
