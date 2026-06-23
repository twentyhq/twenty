import { motion } from 'framer-motion';
import { useTheme } from '@ui/theme-constants';

type AnimatedTranslationProps = {
  children: React.ReactNode;
};

export const AnimatedTranslation = ({ children }: AnimatedTranslationProps) => {
  const theme = useTheme();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {
          opacity: 0,
          y: -20,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: theme.animation.duration.normal,
            ease: 'easeInOut',
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
