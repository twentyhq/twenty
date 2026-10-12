import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Dropdown.module.scss';

type DropdownGroupProps = MenuPrimitive.Group.Props;

export const DropdownGroup = ({ className, ...props }: DropdownGroupProps) => (
  <MenuPrimitive.Group
    {...props}
    className={mergeClassNames(styles.group, className)}
  />
);
