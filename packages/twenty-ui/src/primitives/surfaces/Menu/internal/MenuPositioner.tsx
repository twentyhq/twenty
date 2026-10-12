import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { useContext } from 'react';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Menu.module.scss';
import { type MenuPositionerProps } from '../types/MenuPositionerProps';
import { MenuNestingContext } from './MenuNestingContext';
import { MENU_POPUP_POSITION_DEFAULTS } from './MenuPopupPositionDefaults';

export const MenuPositioner = ({
  side,
  align,
  sideOffset,
  alignOffset,
  className,
  ...props
}: MenuPositionerProps) => {
  const direction = useProvidedTextDirection();
  const isNested = useContext(MenuNestingContext);
  const defaults = MENU_POPUP_POSITION_DEFAULTS[isNested ? 'submenu' : 'root'];

  return (
    <MenuPrimitive.Positioner
      dir={direction}
      side={side ?? defaults.side}
      align={align ?? defaults.align}
      sideOffset={sideOffset ?? defaults.sideOffset}
      alignOffset={alignOffset ?? defaults.alignOffset}
      {...props}
      className={mergeClassNames(styles.positioner, className)}
    />
  );
};
