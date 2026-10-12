import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Dropdown.module.scss';

type DropdownGroupLabelProps = MenuPrimitive.GroupLabel.Props;

export const DropdownGroupLabel = ({
  className,
  ...props
}: DropdownGroupLabelProps) => (
  <MenuPrimitive.GroupLabel
    {...props}
    className={mergeClassNames(styles.groupLabel, className)}
  />
);
