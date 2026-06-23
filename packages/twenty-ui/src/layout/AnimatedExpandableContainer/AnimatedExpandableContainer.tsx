import { type AnimationDimension } from '@ui/layout/AnimatedExpandableContainer/types/AnimationDimension';
import { type AnimationDurationObject } from '@ui/layout/AnimatedExpandableContainer/types/AnimationDurationObject';
import { type AnimationDurations } from '@ui/layout/AnimatedExpandableContainer/types/AnimationDurations';
import { type AnimationMode } from '@ui/layout/AnimatedExpandableContainer/types/AnimationMode';
import { type AnimationSize } from '@ui/layout/AnimatedExpandableContainer/types/AnimationSize';
import { getExpandableAnimationConfig } from '@ui/layout/AnimatedExpandableContainer/utils/getExpandableAnimationConfig';
import { useTheme } from '@ui/theme-constants';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useRef, useState } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
  const theme = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<AnimationSize>(0);

  const normalDuration = theme.animation.duration.normal;

  const actualDurations: AnimationDurationObject =
    animationDurations === 'default'
      ? {
          opacity: normalDuration,
          size: normalDuration,
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
