import { Select as SelectPrimitive } from '@base-ui/react/select';
import { clsx } from 'clsx';

import listItemStyles from '@ui/primitives/navigation/ListItem/ListItem.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { type SelectItemTextProps } from '../types/SelectItemTextProps';

export const SelectItemText = ({
  className,
  ...props
}: SelectItemTextProps) => (
  <SelectPrimitive.ItemText
    {...props}
    className={mergeClassNames(
      clsx(listItemStyles.label, listItemStyles.text),
      className,
    )}
  />
);
