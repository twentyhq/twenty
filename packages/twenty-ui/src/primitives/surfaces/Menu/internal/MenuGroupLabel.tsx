import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Menu.module.scss';
import { type MenuGroupLabelProps } from '../types/MenuGroupLabelProps';

export const MenuGroupLabel = ({
  className,
  ...props
}: MenuGroupLabelProps) => (
  <MenuPrimitive.GroupLabel
    {...props}
    className={mergeClassNames(styles.groupLabel, className)}
  />
);
