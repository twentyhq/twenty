import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { type ReactNode } from 'react';

const StyledEmptyContainerBase = styled.div`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
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

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderEmptyTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  text-align: center;
  width: 100%;
`;

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderEmptyTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

// eslint-disable-next-line twenty/styled-components-prefixed-with-styled
export const AnimatedPlaceholderEmptySubTitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  max-height: 2.8em;
  overflow: hidden;
  width: 50%;
`;
