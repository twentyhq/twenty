import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Checkbox.module.scss';
import { type CheckboxIndicatorProps } from '../types/CheckboxIndicatorProps';

export const CheckboxIndicator = ({
  className,
  ...props
}: CheckboxIndicatorProps) => (
  <CheckboxPrimitive.Indicator
    {...props}
    className={mergeClassNames(styles.indicator, className)}
  />
);
