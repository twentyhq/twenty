import { type MenuAlign } from '../types/MenuAlign';
import { type MenuSide } from '../types/MenuSide';

export const MENU_POPUP_POSITION_DEFAULTS: Record<
  'root' | 'submenu',
  { side: MenuSide; align: MenuAlign; sideOffset: number; alignOffset: number }
> = {
  root: { side: 'bottom', align: 'start', sideOffset: 8, alignOffset: 0 },
  submenu: {
    side: 'inline-end',
    align: 'start',
    sideOffset: 0,
    alignOffset: -4,
  },
};
