import { clsx } from 'clsx';
import { type ComponentPropsWithRef } from 'react';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import styles from '../Dropdown.module.scss';

export const DropdownSeparator = ({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) => (
  <MenuPrimitive.Separator
    {...props}
    role="separator"
    data-dropdown-separator=""
    className={clsx(styles.separator, className)}
  />
);
