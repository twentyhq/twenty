import { useTheme } from '@emotion/react';
import { type AnimationDuration } from '@ui/theme';
import { type HTMLMotionProps, motion } from 'framer-motion';

type AnimatedRotateProps = Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'transition' | 'exit'
> & {
  duration?: AnimationDuration;
  animateOnHover?: boolean;
};

export const AnimatedRotate = ({
  children,
  duration = 'fast',
  animateOnHover,
}: AnimatedRotateProps): JSX.Element => {
  const theme = useTheme();
  const initial = { opacity: 0, rotate: -90 };
  const animate = { opacity: 1, rotate: 0 };
  const exit = { opacity: 0, rotate: 90 };
  const transition = {
    duration: theme.animation.duration[duration],
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      exit={exit}
      whileHover={
        animateOnHover
          ? {
              rotate: 45,
              transition: {
                duration: theme.animation.duration.fast,
              },
            }
          : {}
      }
    >
      {children}
    </motion.div>
  );
};
