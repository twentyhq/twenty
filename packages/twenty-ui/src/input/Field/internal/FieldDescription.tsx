import { Field as FieldPrimitive } from '@base-ui/react/field';
import { forwardRef } from 'react';

import styles from './FieldDescription.module.scss';
import { mergeFieldPartClassName } from './mergeFieldPartClassName';

type FieldDescriptionProps = React.ComponentPropsWithoutRef<
  typeof FieldPrimitive.Description
>;

export const FieldDescription = forwardRef<
  React.ElementRef<typeof FieldPrimitive.Description>,
  FieldDescriptionProps
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Description
    ref={ref}
    className={mergeFieldPartClassName(styles.description, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

FieldDescription.displayName = 'FieldDescription';
