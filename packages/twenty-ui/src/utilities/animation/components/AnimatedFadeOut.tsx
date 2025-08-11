import { useTheme } from '@emotion/react';
import { type AnimationDuration } from '@ui/theme';
import { AnimatePresence, motion } from 'framer-motion';

type AnimatedFadeOutProps = {
  isOpen: boolean;
  children: React.ReactNode;
  duration?: AnimationDuration;
  marginBottom?: string;
  marginTop?: string;
};

export const AnimatedFadeOut = ({
  isOpen,
  children,
  duration = 'normal',
  marginBottom,
  marginTop,
}: AnimatedFadeOutProps) => {
  const theme = useTheme();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 1,
            marginBottom: marginBottom ?? 0,
            marginTop: marginTop ?? 0,
          }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0 }}
          transition={{
            duration: theme.animation.duration[duration],
            ease: 'easeOut',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
