import { Select as SelectPrimitive } from '@base-ui/react/select';

import { IconChevronDown } from '@ui/icon';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectIconProps } from '../types/SelectIconProps';

export const SelectIcon = ({
  className,
  children = <IconChevronDown />,
  ...props
}: SelectIconProps) => (
  <SelectPrimitive.Icon
    {...props}
    className={mergeClassNames(styles.icon, className)}
  >
    {children}
  </SelectPrimitive.Icon>
);
