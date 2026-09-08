import { Field as FieldPrimitive } from '@base-ui/react/field';
import { forwardRef } from 'react';

import { mergePartClassName } from '@ui/utilities/internal/mergePartClassName';

import styles from './FieldError.module.scss';

type FieldErrorProps = React.ComponentPropsWithoutRef<
  typeof FieldPrimitive.Error
>;

export const FieldError = forwardRef<
  React.ElementRef<typeof FieldPrimitive.Error>,
  FieldErrorProps
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Error
    ref={ref}
    className={mergePartClassName(styles.error, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

FieldError.displayName = 'FieldError';
