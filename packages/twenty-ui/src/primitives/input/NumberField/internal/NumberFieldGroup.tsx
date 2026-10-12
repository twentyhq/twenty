import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../NumberField.module.scss';
import { type NumberFieldGroupProps } from '../types/NumberFieldGroupProps';

export const NumberFieldGroup = ({
  className,
  ...props
}: NumberFieldGroupProps) => (
  <NumberFieldPrimitive.Group
    {...props}
    className={mergeClassNames(styles.group, className)}
  />
);
