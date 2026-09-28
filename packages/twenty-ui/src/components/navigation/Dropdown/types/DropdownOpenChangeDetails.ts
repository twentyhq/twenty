import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { type BaseUIChangeEventDetails } from '@base-ui/react/types';

export type DropdownOpenChangeDetails = BaseUIChangeEventDetails<
  PopoverPrimitive.Root.ChangeEventReason | 'item-press' | 'list-navigation'
>;
