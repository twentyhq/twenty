import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Menu.module.scss';
import { type MenuGroupProps } from '../types/MenuGroupProps';

export const MenuGroup = ({ className, ...props }: MenuGroupProps) => (
  <MenuPrimitive.Group
    {...props}
    className={mergeClassNames(styles.group, className)}
  />
);
