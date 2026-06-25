import { clsx } from 'clsx';
import { type JSX } from 'react';

import { type AnimationDuration } from '@ui/theme';

import styles from './AnimatedRotate.module.scss';

type AnimatedRotateProps = {
  children?: React.ReactNode;
  duration?: AnimationDuration;
  animateOnHover?: boolean;
};

export const AnimatedRotate = ({
  children,
  duration = 'fast',
  animateOnHover,
}: AnimatedRotateProps): JSX.Element => (
  <div
    className={clsx(styles.container, animateOnHover && styles.animateOnHover)}
    data-duration={duration}
  >
    {children}
  </div>
);
