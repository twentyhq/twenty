import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { useContext } from 'react';

const StyledCardFooter = styled.div<{ divider?: boolean; theme: ThemeType }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-top: ${({ divider = true, theme }) =>
    divider ? `1px solid ${theme.border.color.medium}` : '0'};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

export const CardFooter = (
  props: CardFooterProps<
    React.ComponentProps<typeof StyledCardFooter>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledCardFooter {...props} theme={theme} />;
};
