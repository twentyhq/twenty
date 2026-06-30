import { clsx } from 'clsx';

import styles from './JsonList.module.scss';

export const JsonList = ({
  depth,
  className,
  children,
}: {
  depth: number;
  className?: string;
  children?: React.ReactNode;
}) => (
  <ul className={clsx(styles.list, depth > 0 && styles.nested, className)}>
    {children}
  </ul>
);
