import { Field as FieldPrimitive } from '@base-ui/react/field';
import { forwardRef } from 'react';

import styles from './FieldError.module.scss';
import { mergeFieldPartClassName } from './mergeFieldPartClassName';

type FieldErrorProps = React.ComponentPropsWithoutRef<
  typeof FieldPrimitive.Error
>;

export const FieldError = forwardRef<
  React.ElementRef<typeof FieldPrimitive.Error>,
  FieldErrorProps
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Error
    ref={ref}
    className={mergeFieldPartClassName(styles.error, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

FieldError.displayName = 'FieldError';
