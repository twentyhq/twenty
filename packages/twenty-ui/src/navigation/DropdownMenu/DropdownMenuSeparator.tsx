import { forwardRef } from 'react';

import styles from './DropdownMenu.module.scss';

export const DropdownMenuSeparator = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    className={styles.separator}
    data-dropdown-menu-separator
    role="separator"
  />
));

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
