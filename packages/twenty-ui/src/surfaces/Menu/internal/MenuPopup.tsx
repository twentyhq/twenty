import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { useContext } from 'react';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';
import { useThemeContainer } from '@ui/theme-constants';

import styles from '../Menu.module.scss';
import { type MenuPopupProps } from '../types/MenuPopupProps';
import { MenuNestingContext } from './MenuNestingContext';
import { MENU_POPUP_POSITION_DEFAULTS } from './MenuPopupPositionDefaults';

export const MenuPopup = ({
  side,
  align,
  sideOffset,
  alignOffset,
  anchor,
  keepMounted,
  className,
  children,
  ...props
}: MenuPopupProps) => {
  const themeContainer = useThemeContainer();
  const { container = themeContainer ?? undefined, ...popupProps } = props;
  const nested = useContext(MenuNestingContext);
  const defaults = MENU_POPUP_POSITION_DEFAULTS[nested ? 'submenu' : 'root'];

  return (
    <MenuPrimitive.Portal container={container} keepMounted={keepMounted}>
      <MenuPrimitive.Positioner
        side={side ?? defaults.side}
        align={align ?? defaults.align}
        sideOffset={sideOffset ?? defaults.sideOffset}
        alignOffset={alignOffset ?? defaults.alignOffset}
        anchor={anchor}
        className={styles.positioner}
      >
        <MenuPrimitive.Popup
          {...popupProps}
          className={mergeFieldPartClassName(styles.popup, className)}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
};
