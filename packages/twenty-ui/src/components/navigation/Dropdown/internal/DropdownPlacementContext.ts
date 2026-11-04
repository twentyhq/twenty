import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { createContext } from 'react';

export const DropdownPlacementContext = createContext<
  Pick<PopoverPrimitive.Popup.State, 'side' | 'align'> | undefined
>(undefined);
