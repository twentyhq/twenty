import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { type PopoverAlign } from './PopoverAlign';
import { type PopoverSide } from './PopoverSide';

export type PopoverPopupProps = PopoverPrimitive.Popup.Props & {
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  alignOffset?: number;
  arrow?: boolean;
  anchor?: PopoverPrimitive.Positioner.Props['anchor'];
  container?: PopoverPrimitive.Portal.Props['container'];
  keepMounted?: boolean;
};
