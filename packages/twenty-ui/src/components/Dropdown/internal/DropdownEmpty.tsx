import { clsx } from 'clsx';
import { type ComponentPropsWithRef } from 'react';

import styles from '../Dropdown.module.scss';

export const DropdownEmpty = ({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) => (
  <div
    {...props}
    role="status"
    aria-live="polite"
    className={clsx(styles.status, className)}
  />
);
