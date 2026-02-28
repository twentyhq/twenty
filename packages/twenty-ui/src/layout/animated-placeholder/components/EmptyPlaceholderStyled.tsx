import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { type ReactNode, useContext } from 'react';

const StyledEmptyContainerBase = styled.div<{ theme: ThemeType }>`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  justify-content: center;
  text-align: center;
`;

const MotionEmptyContainer = motion.create(StyledEmptyContainerBase);

type AnimatedPlaceholderEmptyContainerProps = Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'transition'
> & {
  children?: ReactNode;
  className?: string;
};

export const AnimatedPlaceholderEmptyContainer = ({
  children,
  className,
  initial,
  animate,
  transition,
}: AnimatedPlaceholderEmptyContainerProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <MotionEmptyContainer
      theme={theme}
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </MotionEmptyContainer>
  );
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

export const AnimatedPlaceholderEmptyTextContainer = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledEmptyTextContainer theme={theme} className={className}>
      {children}
    </StyledEmptyTextContainer>
  );
};

const StyledEmptyTitle = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export const AnimatedPlaceholderEmptyTitle = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledEmptyTitle theme={theme} className={className}>
      {children}
    </StyledEmptyTitle>
  );
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

export const AnimatedPlaceholderEmptySubTitle = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledEmptySubTitle theme={theme} className={className}>
      {children}
    </StyledEmptySubTitle>
  );
};
