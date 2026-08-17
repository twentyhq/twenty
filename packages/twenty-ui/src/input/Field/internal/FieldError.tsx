import { Field as FieldPrimitive } from '@base-ui/react/field';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

import styles from './FieldError.module.scss';

type FieldErrorProps = React.ComponentPropsWithoutRef<
  typeof FieldPrimitive.Error
>;

export const FieldError = forwardRef<
  React.ElementRef<typeof FieldPrimitive.Error>,
  FieldErrorProps
>(({ className, match = true, ...props }, ref) => (
  <FieldPrimitive.Error
    ref={ref}
    match={match}
    className={(state) =>
      clsx(
        styles.error,
        typeof className === 'function' ? className(state) : className,
      )
    }
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

FieldError.displayName = 'FieldError';
