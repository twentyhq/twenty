import { clsx } from 'clsx';

import styles from './InputLabel.module.scss';

type InputLabelProps = {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

/**
 * @deprecated Compose `Field.Label` inside `Field.Root` (from `twenty-ui/input`) instead.
 */
export const InputLabel = ({
  children,
  className,
  htmlFor,
}: InputLabelProps) => (
  <label className={clsx(styles.label, className)} htmlFor={htmlFor}>
    {children}
  </label>
);
