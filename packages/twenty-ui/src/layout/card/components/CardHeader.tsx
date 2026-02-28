import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { useContext } from 'react';

const StyledCardHeader = styled.div<{ theme: ThemeType }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

export const CardHeader = (
  props: CardHeaderProps<
    React.ComponentProps<typeof StyledCardHeader>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledCardHeader {...props} theme={theme} />;
};
