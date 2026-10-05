import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Menu.module.scss';
import { type MenuSeparatorProps } from '../types/MenuSeparatorProps';

export const MenuSeparator = ({ className, ...props }: MenuSeparatorProps) => (
  <MenuPrimitive.Separator
    {...props}
    className={mergeClassNames(styles.separator, className)}
  />
);
