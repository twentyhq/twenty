import { type AnimationDimension } from '@ui/layout/animated-expandable-container/types/AnimationDimension';
import { type AnimationDurationObject } from '@ui/layout/animated-expandable-container/types/AnimationDurationObject';
import { type AnimationDurations } from '@ui/layout/animated-expandable-container/types/AnimationDurations';
import { type AnimationMode } from '@ui/layout/animated-expandable-container/types/AnimationMode';
import { type AnimationSize } from '@ui/layout/animated-expandable-container/types/AnimationSize';
import { getExpandableAnimationConfig } from '@ui/layout/animated-expandable-container/utils/getExpandableAnimationConfig';
import { ThemeContext } from '@ui/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useContext, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type AnimatedExpandableContainerProps = {
  children: ReactNode;
  isExpanded: boolean;
  dimension?: AnimationDimension;
  animationDurations?: AnimationDurations;
  mode?: AnimationMode;
  containAnimation?: boolean;
  initial?: boolean;
};

export const AnimatedExpandableContainer = ({
  children,
  isExpanded,
  dimension = 'height',
  animationDurations = 'default',
  mode = 'scroll-height',
  containAnimation = true,
  initial = true,
}: AnimatedExpandableContainerProps) => {
  const { theme } = useContext(ThemeContext);
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
    <AnimatePresence initial={initial}>
      {isExpanded && (
        <motion.div
          ref={contentRef}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={motionAnimationVariants}
          onAnimationStart={updateSize}
          style={
            containAnimation
              ? {
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  width: '100%',
                }
              : undefined
          }
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
