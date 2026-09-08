import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Menu.module.scss';
import { type MenuRadioGroupProps } from '../types/MenuRadioGroupProps';

export const MenuRadioGroup = ({
  className,
  ...props
}: MenuRadioGroupProps) => (
  <MenuPrimitive.RadioGroup
    {...props}
    className={mergeClassNames(styles.group, className)}
  />
);
