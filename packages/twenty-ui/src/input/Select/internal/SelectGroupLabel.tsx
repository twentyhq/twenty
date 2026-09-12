import { Select as SelectPrimitive } from '@base-ui/react/select';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectGroupLabelProps } from '../types/SelectGroupLabelProps';

export const SelectGroupLabel = ({
  className,
  ...props
}: SelectGroupLabelProps) => (
  <SelectPrimitive.GroupLabel
    {...props}
    className={mergeClassNames(styles.groupLabel, className)}
  />
);
