import { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '@ui/theme';

type AnimatedTranslationProps = {
  children: React.ReactNode;
};

export const AnimatedTranslation = ({ children }: AnimatedTranslationProps) => {
  const { theme } = useContext(ThemeContext);

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
            duration: theme.animation.duration.normal, // Replace this with your theme's duration
            ease: 'easeInOut',
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
