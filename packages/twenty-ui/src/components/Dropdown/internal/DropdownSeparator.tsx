import { clsx } from 'clsx';
import { type ComponentPropsWithRef } from 'react';

import styles from '../Dropdown.module.scss';

export const DropdownSeparator = ({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) => (
  <div
    {...props}
    role="separator"
    className={clsx(styles.separator, className)}
  />
);
