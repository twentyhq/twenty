import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import styles from './AutogrowWrapper.module.scss';

type AutogrowWrapperProps = {
  children: ReactNode;
  node?: ReactNode;
  className?: string;
};

export const AutogrowWrapper = ({
  children,
  node = children,
  className,
}: AutogrowWrapperProps) => {
  return (
    <div className={clsx(styles.container, className)}>
      <span className={styles.nodeWrapper}>{node}</span>
      <div className={styles.childWrapper}>{children}</div>
    </div>
  );
};
