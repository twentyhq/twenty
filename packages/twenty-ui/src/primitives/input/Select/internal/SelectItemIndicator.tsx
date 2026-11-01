import { Select as SelectPrimitive } from '@base-ui/react/select';

import { IconCheck } from '@ui/icon';
import listItemStyles from '@ui/primitives/navigation/ListItem/ListItem.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectItemIndicatorProps } from '../types/SelectItemIndicatorProps';

export const SelectItemIndicator = ({
  className,
  children = <IconCheck className={listItemStyles.checkIndicator} />,
  ...props
}: SelectItemIndicatorProps) => (
  <SelectPrimitive.ItemIndicator
    {...props}
    className={mergeClassNames(styles.indicator, className)}
  >
    {children}
  </SelectPrimitive.ItemIndicator>
);
