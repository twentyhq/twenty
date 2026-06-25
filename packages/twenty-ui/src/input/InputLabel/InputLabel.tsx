import { clsx } from 'clsx';

import styles from './InputLabel.module.scss';

type InputLabelProps = {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

export const InputLabel = ({
  children,
  className,
  htmlFor,
}: InputLabelProps) => (
  <label className={clsx(styles.label, className)} htmlFor={htmlFor}>
    {children}
  </label>
);
