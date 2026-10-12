import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Menu.module.scss';
import { type MenuPopupProps } from '../types/MenuPopupProps';

export const MenuPopup = ({ className, ...props }: MenuPopupProps) => (
  <MenuPrimitive.Popup
    {...props}
    className={mergeClassNames(styles.popup, className)}
  />
);
