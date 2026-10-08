import { Select as SelectPrimitive } from '@base-ui/react/select';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectSeparatorProps } from '../types/SelectSeparatorProps';

export const SelectSeparator = ({
  className,
  ...props
}: SelectSeparatorProps) => (
  <SelectPrimitive.Separator
    {...props}
    className={mergeClassNames(styles.separator, className)}
  />
);
