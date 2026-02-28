import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { useContext } from 'react';

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

export const Card = (
  props: CardProps<React.ComponentProps<typeof StyledCard>, 'theme'>,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledCard {...props} theme={theme} />;
};
