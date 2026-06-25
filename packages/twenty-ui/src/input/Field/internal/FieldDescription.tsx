import { Field as FieldPrimitive } from '@base-ui/react/field';
import { clsx } from 'clsx';

import styles from './FieldDescription.module.scss';

type FieldDescriptionProps = {
  children?: React.ReactNode;
  className?: string;
};

export const FieldDescription = ({
  children,
  className,
}: FieldDescriptionProps) => (
  <FieldPrimitive.Description className={clsx(styles.description, className)}>
    {children}
  </FieldPrimitive.Description>
);
