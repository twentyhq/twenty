import { clsx } from 'clsx';

import styles from './InputHint.module.scss';

type InputHintProps = {
  children?: React.ReactNode;
  className?: string;
  danger?: boolean;
};

/**
 * @deprecated Inside `Field.Root` (from `twenty-ui/input`), use `Field.Description` for hints or `Field.Error` for errors (replaces `danger`).
 */
export const InputHint = ({ children, className, danger }: InputHintProps) => (
  <div className={clsx(styles.hint, danger && styles.danger, className)}>
    {children}
  </div>
);
