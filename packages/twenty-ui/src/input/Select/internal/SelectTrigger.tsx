import { Select as SelectPrimitive } from '@base-ui/react/select';
import { clsx } from 'clsx';

import { IconChevronDown } from '@ui/icon';
import inputStyles from '@ui/input/Input/Input.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectTriggerProps } from '../types/SelectTriggerProps';

export const SelectTrigger = ({
  size = 'md',
  className,
  children,
  ...props
}: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    {...props}
    className={mergeClassNames(
      clsx(inputStyles.input, inputStyles[size], styles.trigger),
      className,
    )}
  >
    {children}
    <SelectPrimitive.Icon className={styles.icon}>
      <IconChevronDown />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);
