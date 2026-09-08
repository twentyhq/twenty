import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Menu.module.scss';
import { type MenuRadioGroupProps } from '../types/MenuRadioGroupProps';

export const MenuRadioGroup = ({
  className,
  ...props
}: MenuRadioGroupProps) => (
  <MenuPrimitive.RadioGroup
    {...props}
    className={mergeFieldPartClassName(styles.group, className)}
  />
);
