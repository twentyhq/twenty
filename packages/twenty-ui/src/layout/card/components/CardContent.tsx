import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { useContext } from 'react';

const StyledCardContent = styled.div<{
  divider?: boolean;
  theme: ThemeType;
}>`
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${({ theme }) => theme.spacing(4)};

  ${({ divider, theme }) =>
    divider
      ? `
          border-bottom: 1px solid ${theme.border.color.medium};
        `
      : ''}
`;

export const CardContent = (
  props: CardContentProps<
    React.ComponentProps<typeof StyledCardContent>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledCardContent {...props} theme={theme} />;
};
