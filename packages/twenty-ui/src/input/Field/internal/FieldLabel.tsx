import { Field as FieldPrimitive } from '@base-ui/react/field';
import { forwardRef } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

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
    className={mergeClassNames(styles.label, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

FieldLabel.displayName = 'FieldLabel';
