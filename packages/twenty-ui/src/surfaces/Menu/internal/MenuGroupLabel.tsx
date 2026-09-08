import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Menu.module.scss';
import { type MenuGroupLabelProps } from '../types/MenuGroupLabelProps';

export const MenuGroupLabel = ({
  className,
  ...props
}: MenuGroupLabelProps) => (
  <MenuPrimitive.GroupLabel
    {...props}
    className={mergeFieldPartClassName(styles.groupLabel, className)}
  />
);
