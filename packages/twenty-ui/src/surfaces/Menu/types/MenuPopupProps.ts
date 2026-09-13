import { type Menu as MenuPrimitive } from '@base-ui/react/menu';

import { type MenuAlign } from './MenuAlign';
import { type MenuSide } from './MenuSide';

export type MenuPopupProps = MenuPrimitive.Popup.Props & {
  side?: MenuSide;
  align?: MenuAlign;
  sideOffset?: number;
  alignOffset?: number;
  anchor?: MenuPrimitive.Positioner.Props['anchor'];
  container?: MenuPrimitive.Portal.Props['container'];
  keepMounted?: boolean;
};
