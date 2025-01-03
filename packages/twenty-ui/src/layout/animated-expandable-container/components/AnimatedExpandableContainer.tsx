import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimationDimension } from '@ui/layout/animated-expandable-container/types/AnimationDimension';
import { AnimationDurationObject } from '@ui/layout/animated-expandable-container/types/AnimationDurationObject';
import { AnimationDurations } from '@ui/layout/animated-expandable-container/types/AnimationDurations';
import { AnimationMode } from '@ui/layout/animated-expandable-container/types/AnimationMode';
import { AnimationSize } from '@ui/layout/animated-expandable-container/types/AnimationSize';
import { getExpandableAnimationConfig } from '@ui/layout/animated-expandable-container/utils/getExpandableAnimationConfig';
import { isDefined } from '@ui/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';

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
