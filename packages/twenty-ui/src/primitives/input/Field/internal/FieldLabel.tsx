import { Field as FieldPrimitive } from '@base-ui/react/field';
import { forwardRef } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { type FieldLabelProps } from '../types/FieldLabelProps';
import styles from './FieldLabel.module.scss';

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
