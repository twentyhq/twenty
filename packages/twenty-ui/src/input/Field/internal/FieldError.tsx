import { Field as FieldPrimitive } from '@base-ui/react/field';
import { clsx } from 'clsx';

import styles from './FieldError.module.scss';

type FieldErrorProps = {
  children?: React.ReactNode;
  className?: string;
  match?: React.ComponentProps<typeof FieldPrimitive.Error>['match'];
};

export const FieldError = ({
  children,
  className,
  match = true,
}: FieldErrorProps) => (
  <FieldPrimitive.Error className={clsx(styles.error, className)} match={match}>
    {children}
  </FieldPrimitive.Error>
);
