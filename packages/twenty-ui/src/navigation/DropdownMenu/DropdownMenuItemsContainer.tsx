import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import styles from './DropdownMenu.module.scss';

export const DropdownMenuItemsContainer = ({
  children,
  hasMaxHeight,
  scrollable = true,
  className,
  role = 'listbox',
}: {
  children: ReactNode;
  hasMaxHeight?: boolean;
  scrollable?: boolean;
  className?: string;
  role?: 'listbox' | 'presentation';
}) => {
  const content = (
    <div
      className={clsx(styles.external, !scrollable && className)}
      role={role}
    >
      <div className={styles.internal}>{children}</div>
    </div>
  );

  return scrollable ? (
    <div
      className={clsx(styles.scrollable, className)}
      data-max-height={hasMaxHeight || undefined}
    >
      {content}
    </div>
  ) : (
    content
  );
};
