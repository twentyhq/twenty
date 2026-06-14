import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import styles from './MenuItemIconBoxContainer.module.scss';

export const StyledIconContainer = ({
  children,
  className,
  hasBackground = true,
}: {
  children?: ReactNode;
  className?: string;
  hasBackground?: boolean;
}) => (
  <div
    className={clsx(
      styles.iconContainer,
      hasBackground && styles.withBackground,
      className,
    )}
  >
    {children}
  </div>
);

export { StyledIconContainer as MenuItemIconBoxContainer };
