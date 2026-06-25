import { Field as FieldPrimitive } from '@base-ui/react/field';
import { clsx } from 'clsx';

import styles from './FieldLabel.module.scss';

type FieldLabelProps = {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

export const FieldLabel = ({
  children,
  className,
  htmlFor,
}: FieldLabelProps) => (
  <FieldPrimitive.Label
    className={clsx(styles.label, className)}
    htmlFor={htmlFor}
  >
    {children}
  </FieldPrimitive.Label>
);
