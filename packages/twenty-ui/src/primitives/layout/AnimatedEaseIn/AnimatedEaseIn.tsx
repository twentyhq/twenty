import { type AnimationDuration } from '@ui/theme';

import styles from './AnimatedEaseIn.module.scss';

type AnimatedEaseInProps = {
  children?: React.ReactNode;
  duration?: AnimationDuration;
};

export const AnimatedEaseIn = ({
  children,
  duration = 'normal',
}: AnimatedEaseInProps) => (
  <div className={styles.fadeIn} data-duration={duration}>
    {children}
  </div>
);
