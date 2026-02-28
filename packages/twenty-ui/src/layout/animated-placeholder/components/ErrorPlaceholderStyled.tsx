import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { useContext } from 'react';

const StyledErrorContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  justify-content: center;
  text-align: center;
`;

export const AnimatedPlaceholderErrorContainer = (
  props: AnimatedPlaceholderErrorContainerProps<
    React.ComponentProps<typeof StyledErrorContainer>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledErrorContainer {...props} theme={theme} />;
};

const StyledErrorTextContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export const AnimatedPlaceholderErrorTextContainer = (
  props: AnimatedPlaceholderErrorTextContainerProps<
    React.ComponentProps<typeof StyledErrorTextContainer>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledErrorTextContainer {...props} theme={theme} />;
};

const StyledErrorTitle = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

export const AnimatedPlaceholderErrorTitle = (
  props: AnimatedPlaceholderErrorTitleProps<
    React.ComponentProps<typeof StyledErrorTitle>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledErrorTitle {...props} theme={theme} />;
};

const StyledErrorSubTitle = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  max-height: 2.4em;
  overflow: hidden;
`;

export const AnimatedPlaceholderErrorSubTitle = (
  props: AnimatedPlaceholderErrorSubTitleProps<
    React.ComponentProps<typeof StyledErrorSubTitle>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledErrorSubTitle {...props} theme={theme} />;
};
