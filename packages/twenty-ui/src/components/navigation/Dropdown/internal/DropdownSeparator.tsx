import { clsx } from 'clsx';
import { type ComponentPropsWithRef } from 'react';

import { MenuSeparator } from '@ui/primitives/surfaces/Menu/internal/MenuSeparator';

import styles from '../Dropdown.module.scss';

export const DropdownSeparator = ({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) => (
  <MenuSeparator
    {...props}
    role="separator"
    data-dropdown-separator=""
    className={clsx(styles.separator, className)}
  />
);
