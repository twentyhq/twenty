import { Field as FieldPrimitive } from '@base-ui/react/field';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

import styles from './FieldLabel.module.scss';

type FieldLabelProps = React.ComponentPropsWithoutRef<
  typeof FieldPrimitive.Label
>;

export const FieldLabel = forwardRef<
  React.ElementRef<typeof FieldPrimitive.Label>,
  FieldLabelProps
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Label
    ref={ref}
    className={(state) =>
      clsx(
        styles.label,
        typeof className === 'function' ? className(state) : className,
      )
    }
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));
