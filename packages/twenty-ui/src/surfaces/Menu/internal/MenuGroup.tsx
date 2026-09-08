import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Menu.module.scss';
import { type MenuGroupProps } from '../types/MenuGroupProps';

export const MenuGroup = ({ className, ...props }: MenuGroupProps) => (
  <MenuPrimitive.Group
    {...props}
    className={mergeFieldPartClassName(styles.group, className)}
  />
);
