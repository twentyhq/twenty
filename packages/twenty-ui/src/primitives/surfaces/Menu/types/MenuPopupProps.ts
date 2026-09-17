import { type Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuAlign } from './MenuAlign';
import { type MenuSide } from './MenuSide';

export type MenuPopupProps = MenuPrimitive.Popup.Props & {
  /**
   * Side of the anchor the popup is placed on. Defaults to `bottom` for a menu
   * and `inline-end` for a submenu.
   */
  side?: MenuSide;
  /** Alignment of the popup along the anchor. Defaults to `start`. */
  align?: MenuAlign;
  /**
   * Distance in pixels between the anchor and the popup. Defaults to `8` for a
   * menu and `0` for a submenu.
   */
  sideOffset?: number;
  /**
   * Offset in pixels along the alignment axis. Defaults to `0` for a menu and
   * `-4` for a submenu.
   */
  alignOffset?: number;
  /** Element or position the popup is anchored to. Defaults to the trigger. */
  anchor?: MenuPrimitive.Positioner.Props['anchor'];
  /**
   * Element the popup is portaled into. Defaults to the theme's portal
   * container.
   */
  container?: MenuPrimitive.Portal.Props['container'];
  /** Keeps the popup mounted in the DOM while the menu is closed. */
  keepMounted?: boolean;
};
