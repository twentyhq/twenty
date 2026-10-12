import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { PopoverArrow } from './internal/PopoverArrow';
import { PopoverDescription } from './internal/PopoverDescription';
import { PopoverPopup } from './internal/PopoverPopup';
import { PopoverPortal } from './internal/PopoverPortal';
import { PopoverPositioner } from './internal/PopoverPositioner';
import { PopoverTitle } from './internal/PopoverTitle';

export const Popover = {
  Root: PopoverPrimitive.Root,
  Trigger: PopoverPrimitive.Trigger,
  Portal: PopoverPortal,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Arrow: PopoverArrow,
  Backdrop: PopoverPrimitive.Backdrop,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverPrimitive.Close,
  Viewport: PopoverPrimitive.Viewport,
  Handle: PopoverPrimitive.Handle,
  createHandle: PopoverPrimitive.createHandle,
};
