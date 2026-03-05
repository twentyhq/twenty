import { motion } from 'framer-motion';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

type AnimatedTranslationProps = {
  children: React.ReactNode;
};

export const AnimatedTranslation = ({ children }: AnimatedTranslationProps) => {
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
            duration: resolveThemeVariableAsNumber(
              themeCssVariables.animation.duration.normal,
            ),
            ease: 'easeInOut',
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
