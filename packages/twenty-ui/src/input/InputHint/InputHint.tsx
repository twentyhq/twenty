import { clsx } from 'clsx';

import styles from './InputHint.module.scss';

type InputHintProps = {
  children?: React.ReactNode;
  className?: string;
  danger?: boolean;
};

export const InputHint = ({ children, className, danger }: InputHintProps) => (
  <div className={clsx(styles.hint, danger && styles.danger, className)}>
    {children}
  </div>
);
