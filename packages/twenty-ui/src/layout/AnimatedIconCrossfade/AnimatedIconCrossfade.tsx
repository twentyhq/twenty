import { motion } from 'framer-motion';
import React from 'react';

import { type IconComponent } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

import styles from './AnimatedIconCrossfade.module.scss';

type AnimatedIconCrossfadeProps = {
  isActive: boolean;
  ActiveIcon: IconComponent;
  InactiveIcon: IconComponent;
  size?: number;
};

export const AnimatedIconCrossfade = ({
  isActive,
  ActiveIcon,
  InactiveIcon,
  size,
}: AnimatedIconCrossfadeProps) => {
  const theme = useTheme();

  const iconSize = size ?? theme.icon.size.sm;

  return (
    <div
      className={styles.container}
      style={
        {
          '--animated-icon-crossfade-size': `${iconSize}px`,
        } as React.CSSProperties
      }
    >
      <motion.div
        className={styles.layer}
        initial={false}
        animate={{
          opacity: isActive ? 0 : 1,
          scale: isActive ? 0.85 : 1,
        }}
        transition={{
          duration: theme.animation.duration.fast,
          ease: 'easeInOut',
        }}
      >
        <InactiveIcon size={iconSize} />
      </motion.div>
      <motion.div
        className={styles.layer}
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0.85,
        }}
        transition={{
          duration: theme.animation.duration.fast,
          ease: 'easeInOut',
        }}
      >
        <ActiveIcon size={iconSize} />
      </motion.div>
    </div>
  );
};
