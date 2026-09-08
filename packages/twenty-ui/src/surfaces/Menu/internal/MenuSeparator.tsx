import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Menu.module.scss';
import { type MenuSeparatorProps } from '../types/MenuSeparatorProps';

export const MenuSeparator = ({ className, ...props }: MenuSeparatorProps) => (
  <MenuPrimitive.Separator
    {...props}
    className={mergeFieldPartClassName(styles.separator, className)}
  />
);
