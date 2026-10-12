import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from './AnimatedIconCrossfade.module.scss';
import { type AnimatedIconCrossfadeProps } from './types/AnimatedIconCrossfadeProps';

export const AnimatedIconCrossfade = ({
  isActive,
  activeIcon,
  inactiveIcon,
  className,
  render,
  ref,
  ...props
}: AnimatedIconCrossfadeProps) => {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.container, className),
      children: (
        <>
          <span
            aria-hidden="true"
            className={clsx(
              styles.layer,
              isActive ? styles.hidden : styles.visible,
            )}
          >
            {inactiveIcon}
          </span>
          <span
            aria-hidden="true"
            className={clsx(
              styles.layer,
              isActive ? styles.visible : styles.hidden,
            )}
          >
            {activeIcon}
          </span>
        </>
      ),
    },
  });
};
