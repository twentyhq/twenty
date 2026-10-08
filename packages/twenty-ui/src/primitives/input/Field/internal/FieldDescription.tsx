import { Field as FieldPrimitive } from '@base-ui/react/field';
import { forwardRef } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { type FieldDescriptionProps } from '../types/FieldDescriptionProps';
import styles from './FieldDescription.module.scss';

export const FieldDescription = forwardRef<
  React.ElementRef<typeof FieldPrimitive.Description>,
  FieldDescriptionProps
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Description
    ref={ref}
    className={mergeClassNames(styles.description, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

FieldDescription.displayName = 'FieldDescription';
