import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type AnimationDimension } from '@ui/layout/animated-expandable-container/types/AnimationDimension';
import { type AnimationDurationObject } from '@ui/layout/animated-expandable-container/types/AnimationDurationObject';
import { type AnimationDurations } from '@ui/layout/animated-expandable-container/types/AnimationDurations';
import { type AnimationMode } from '@ui/layout/animated-expandable-container/types/AnimationMode';
import { type AnimationSize } from '@ui/layout/animated-expandable-container/types/AnimationSize';
import { getExpandableAnimationConfig } from '@ui/layout/animated-expandable-container/utils/getExpandableAnimationConfig';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledMotionContainer = styled(motion.div)<{
  containAnimation: boolean;
}>`
  ${({ containAnimation }) =>
    containAnimation &&
    `
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
  `}
`;

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<AnimationSize>(0);

  const actualDurations: AnimationDurationObject =
    animationDurations === 'default'
      ? {
          opacity: theme.animation.duration.normal,
          size: theme.animation.duration.normal,
        }
      : animationDurations;

  const updateSize = () => {
    if (
      mode === 'scroll-height' &&
      dimension === 'height' &&
      isDefined(contentRef.current)
    ) {
      setSize(contentRef.current.scrollHeight);
    }
  };

  const motionAnimationVariants = getExpandableAnimationConfig(
    isExpanded,
    dimension,
    actualDurations.opacity,
    actualDurations.size,
    mode === 'fit-content' ? 'fit-content' : size,
  );

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
          onAnimationStart={updateSize}
        >
          {children}
        </StyledMotionContainer>
      )}
    </AnimatePresence>
  );
};
