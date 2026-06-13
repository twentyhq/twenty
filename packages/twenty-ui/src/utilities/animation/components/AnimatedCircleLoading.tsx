import { motion } from 'framer-motion';
import React, { useContext } from 'react';

import { ThemeContext } from '@ui/theme-constants';

import styles from './AnimatedCircleLoading.module.scss';

export const AnimatedCircleLoading = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <motion.div
      className={styles.container}
      initial={{ rotate: 0 }}
      animate={{
        rotate: 360,
      }}
      transition={{
        repeat: Infinity,
        duration: theme.animation.duration.slow,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};
