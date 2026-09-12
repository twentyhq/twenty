import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { PopoverDescription } from './internal/PopoverDescription';
import { PopoverPopup } from './internal/PopoverPopup';
import { PopoverTitle } from './internal/PopoverTitle';

export const Popover = {
  Root: PopoverPrimitive.Root,
  Trigger: PopoverPrimitive.Trigger,
  Popup: PopoverPopup,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverPrimitive.Close,
};
