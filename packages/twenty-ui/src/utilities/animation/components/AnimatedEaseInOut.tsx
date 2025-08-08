import { useTheme } from '@emotion/react';
import { type AnimationDuration } from '@ui/theme';
import { AnimatePresence, motion } from 'framer-motion';

type AnimatedEaseInOutProps = {
  isOpen: boolean;
  children: React.ReactNode;
  duration?: AnimationDuration;
  marginBottom?: string;
  marginTop?: string;
  initial?: boolean;
};

export const AnimatedEaseInOut = ({
  children,
  isOpen,
  marginBottom,
  marginTop,
  duration = 'normal',
  initial = true,
}: AnimatedEaseInOutProps) => {
  const theme = useTheme();

  return (
    <AnimatePresence initial={initial}>
      {isOpen && (
        <motion.div
          initial={{
            marginBottom: marginBottom ?? 0,
            marginTop: marginTop ?? 0,
            height: 0,
            opacity: 0,
          }}
          animate={{ height: 'fit-content', opacity: 1 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0, marginTop: 0 }}
          transition={{
            duration: theme.animation.duration[duration],
            ease: 'easeInOut',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
