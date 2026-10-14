import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from './StackIcon.module.scss';
import { type StackIconProps } from './types/StackIconProps';

export const StackIcon = ({
  icon,
  stackedIcon,
  className,
  render,
  ref,
  ...props
}: StackIconProps) => {
  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.root, className),
      children: (
        <>
          <span aria-hidden="true">{icon}</span>
          <span aria-hidden="true" className={styles.stackedIcon}>
            {stackedIcon}
          </span>
        </>
      ),
    },
  });
};
