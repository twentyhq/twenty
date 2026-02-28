import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { type ReactNode } from 'react';

const StyledEmptyContainerBase = styled.div`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${themeVar.spacing[6]};
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
  return (
    <MotionEmptyContainer
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

const StyledEmptyTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeVar.spacing[2]};
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
  return (
    <StyledEmptyTextContainer className={className}>
      {children}
    </StyledEmptyTextContainer>
  );
};

const StyledEmptyTitle = styled.div`
  color: ${themeVar.font.color.primary};
  font-size: ${themeVar.font.size.lg};
  font-weight: ${themeVar.font.weight.semiBold};
`;

export const AnimatedPlaceholderEmptyTitle = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return <StyledEmptyTitle className={className}>{children}</StyledEmptyTitle>;
};

const StyledEmptySubTitle = styled.div`
  color: ${themeVar.font.color.tertiary};
  font-size: ${themeVar.font.size.sm};
  font-weight: ${themeVar.font.weight.regular};
  line-height: ${themeVar.text.lineHeight.lg};
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
  return (
    <StyledEmptySubTitle className={className}>{children}</StyledEmptySubTitle>
  );
};
