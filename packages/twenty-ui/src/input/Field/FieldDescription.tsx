import { Field as FieldPrimitive } from '@base-ui/react/field';
import { clsx } from 'clsx';

import styles from './FieldDescription.module.scss';

type FieldDescriptionProps = {
  children?: React.ReactNode;
  className?: string;
  danger?: boolean;
};

export const FieldDescription = ({
  children,
  className,
  danger,
}: FieldDescriptionProps) => (
  <FieldPrimitive.Description
    className={clsx(styles.description, danger && styles.danger, className)}
  >
    {children}
  </FieldPrimitive.Description>
);
