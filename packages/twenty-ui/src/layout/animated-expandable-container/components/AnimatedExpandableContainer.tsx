import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from '@ui/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

type AnimationDimension = 'width' | 'height';
type AnimationMode = 'scroll-height' | 'fit-content';
type Size = number | 'fit-content';

type DurationsObject = {
  opacity: number;
  size: number;
};

type AnimationDurations = DurationsObject | 'default';

const StyledMotionContainer = styled(motion.div)<{
  containAnimation: boolean;
}>`
  ${({ containAnimation = true }) =>
    containAnimation &&
    `
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
  `}
`;

type UseExpandedAnimationProps = {
  isExpanded: boolean;
  dimension: AnimationDimension;
  mode: AnimationMode;
  durations: DurationsObject;
};

export const useExpandedAnimation = ({
  isExpanded,
  dimension,
  mode,
  durations,
}: UseExpandedAnimationProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>(0);

  useLayoutEffect(() => {
    if (
      mode === 'scroll-height' &&
      dimension === 'height' &&
      isDefined(contentRef.current)
    ) {
      setSize(contentRef.current.scrollHeight);
    }
  }, [isExpanded, dimension, mode]);

  const motionAnimationVariants = expandableAnimationConfig(
    isExpanded,
    dimension,
    durations.opacity,
    durations.size,
    mode === 'fit-content' ? 'fit-content' : size,
  );

  return {
    contentRef,
    size,
    motionAnimationVariants,
  };
};

const getTransitionValues = (
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
) => ({
  transition: {
    opacity: {
      duration: opacityDuration,
      ease: 'easeInOut',
    },
    [dimension]: {
      duration: sizeDuration,
      ease: 'easeInOut',
    },
  },
});

const commonStyles = (
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
) => ({
  opacity: 0,
  [dimension]: 0,
  ...getTransitionValues(dimension, opacityDuration, sizeDuration),
});

const expandableAnimationConfig = (
  isExpanded: boolean,
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
  size: Size,
) => ({
  initial: {
    ...commonStyles(dimension, opacityDuration, sizeDuration),
  },
  animate: {
    opacity: 1,
    [dimension]: isExpanded
      ? size === 'fit-content'
        ? 'fit-content'
        : dimension === 'width'
          ? '100%'
          : size
      : 0,
    ...getTransitionValues(dimension, opacityDuration, sizeDuration),
  },
  exit: {
    ...commonStyles(dimension, opacityDuration, sizeDuration),
  },
});

type AnimatedExpandableContainerProps = {
  children: ReactNode;
  isExpanded: boolean;
  dimension?: AnimationDimension;
  animationDurations?: AnimationDurations;
  mode?: AnimationMode;
  containAnimation?: boolean;
};

export const AnimatedExpandableContainer = ({
  children,
  isExpanded,
  dimension = 'height',
  animationDurations = 'default',
  mode = 'scroll-height',
  containAnimation = true,
}: AnimatedExpandableContainerProps) => {
  const theme = useTheme();
  const actualDurations: DurationsObject =
    animationDurations === 'default'
      ? {
          opacity: theme.animation.duration.normal,
          size: theme.animation.duration.normal,
        }
      : animationDurations;

  const { contentRef, motionAnimationVariants } = useExpandedAnimation({
    isExpanded,
    dimension,
    mode,
    durations: actualDurations,
  });

  return (
    <AnimatePresence>
      {isExpanded && (
        <StyledMotionContainer
          containAnimation={containAnimation}
          ref={contentRef}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={motionAnimationVariants}
        >
          {children}
        </StyledMotionContainer>
      )}
    </AnimatePresence>
  );
};
