import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { motion } from 'framer-motion';
import { useContext } from 'react';

const StyledEmptyContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  justify-content: center;
  text-align: center;
`;

export const AnimatedPlaceholderEmptyContainer = (
  props: AnimatedPlaceholderEmptyContainerProps<
    React.ComponentProps<typeof StyledEmptyContainer> &
      React.ComponentProps<typeof motion.div>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledEmptyContainer as={motion.div} {...props} theme={theme} />;
};

export const EMPTY_PLACEHOLDER_TRANSITION_PROPS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.15,
  },
};

const StyledEmptyTextContainer = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export const AnimatedPlaceholderEmptyTextContainer = (
  props: AnimatedPlaceholderEmptyTextContainerProps<
    React.ComponentProps<typeof StyledEmptyTextContainer>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledEmptyTextContainer {...props} theme={theme} />;
};

const StyledEmptyTitle = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export const AnimatedPlaceholderEmptyTitle = (
  props: AnimatedPlaceholderEmptyTitleProps<
    React.ComponentProps<typeof StyledEmptyTitle>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledEmptyTitle {...props} theme={theme} />;
};

const StyledEmptySubTitle = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  max-height: 2.8em;
  overflow: hidden;
  width: 50%;
`;

export const AnimatedPlaceholderEmptySubTitle = (
  props: AnimatedPlaceholderEmptySubTitleProps<
    React.ComponentProps<typeof StyledEmptySubTitle>,
    'theme'
  >,
) => {
  const { theme } = useContext(ThemeContext);
  return <StyledEmptySubTitle {...props} theme={theme} />;
};
