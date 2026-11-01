import { Field as FieldPrimitive } from '@base-ui/react/field';
import { forwardRef } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { type FieldErrorProps } from '../types/FieldErrorProps';
import styles from './FieldError.module.scss';

export const FieldError = forwardRef<
  React.ElementRef<typeof FieldPrimitive.Error>,
  FieldErrorProps
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Error
    ref={ref}
    className={mergeClassNames(styles.error, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

FieldError.displayName = 'FieldError';
