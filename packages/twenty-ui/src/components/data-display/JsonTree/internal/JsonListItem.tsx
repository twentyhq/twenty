import { clsx } from 'clsx';

import styles from './JsonListItem.module.scss';

export const JsonListItem = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => <li className={clsx(styles.listItem, className)}>{children}</li>;
