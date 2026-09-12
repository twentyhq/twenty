import { Select as SelectPrimitive } from '@base-ui/react/select';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectValueProps } from '../types/SelectValueProps';

export const SelectValue = ({ className, ...props }: SelectValueProps) => (
  <SelectPrimitive.Value
    {...props}
    className={mergeClassNames(styles.value, className)}
  />
);
