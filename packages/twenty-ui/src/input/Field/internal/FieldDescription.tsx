import { Field as FieldPrimitive } from '@base-ui/react/field';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

import styles from './FieldDescription.module.scss';

type FieldDescriptionProps = React.ComponentPropsWithoutRef<
  typeof FieldPrimitive.Description
>;

export const FieldDescription = forwardRef<
  React.ElementRef<typeof FieldPrimitive.Description>,
  FieldDescriptionProps
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Description
    ref={ref}
    className={(state) =>
      clsx(
        styles.description,
        typeof className === 'function' ? className(state) : className,
      )
    }
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));
