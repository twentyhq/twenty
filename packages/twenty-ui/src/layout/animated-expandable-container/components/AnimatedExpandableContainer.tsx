import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from '@ui/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';
const StyledAnimatedContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`;

type AnimationDimension = 'width' | 'height';
type AnimationMode = 'scroll-height' | 'fit-content';
type Size = number | 'fit-content';

type UseExpandedAnimationProps = {
  isExpanded: boolean;
  dimension: AnimationDimension;
  mode: AnimationMode;
};

const useExpandedAnimation = ({
  isExpanded,
  dimension,
  mode,
}: UseExpandedAnimationProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>(0);

  useEffect(() => {
    if (
      mode === 'scroll-height' &&
      dimension === 'height' &&
      isDefined(contentRef.current)
    ) {
      setSize(contentRef.current.scrollHeight);
    }
  }, [isExpanded, dimension, mode]);

  return {
    contentRef,
    size,
  };
};

const getTransitionValues = (
  dimension: AnimationDimension,
  opacityDuration: number,
  sizeDuration: number,
) => ({
  transition: {
    opacity: { duration: opacityDuration },
    [dimension]: { duration: sizeDuration },
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
  opacityDuration?: number;
  sizeDuration?: number;
  mode?: AnimationMode;
  useThemeAnimation?: boolean;
};

export const AnimatedExpandableContainer = ({
  children,
  isExpanded,
  dimension = 'height',
  opacityDuration = 0.3,
  sizeDuration = 0.3,
  mode = 'scroll-height',
  useThemeAnimation = false,
}: AnimatedExpandableContainerProps) => {
  const theme = useTheme();
  const actualSizeDuration = useThemeAnimation
    ? theme.animation.duration.normal
    : sizeDuration;

  const actualOpacityDuration = useThemeAnimation
    ? theme.animation.duration.normal
    : opacityDuration;

  const { contentRef, size } = useExpandedAnimation({
    isExpanded,
    dimension,
    mode,
  });

  const motionAnimationVariants = expandableAnimationConfig(
    isExpanded,
    dimension,
    actualOpacityDuration,
    actualSizeDuration,
    mode === 'fit-content' ? 'fit-content' : size,
  );

  return (
    <AnimatePresence>
      {isExpanded && (
        <StyledAnimatedContainer
          ref={contentRef}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={motionAnimationVariants}
        >
          {children}
        </StyledAnimatedContainer>
      )}
    </AnimatePresence>
  );
};
