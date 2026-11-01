import { Select as SelectPrimitive } from '@base-ui/react/select';
import { clsx } from 'clsx';

import listItemStyles from '@ui/primitives/navigation/ListItem/ListItem.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectItemProps } from '../types/SelectItemProps';

export const SelectItem = ({ className, ...props }: SelectItemProps) => (
  <SelectPrimitive.Item
    data-color="neutral"
    data-indicator="check"
    {...props}
    className={mergeClassNames(
      clsx(listItemStyles.root, styles.item),
      className,
    )}
  />
);
