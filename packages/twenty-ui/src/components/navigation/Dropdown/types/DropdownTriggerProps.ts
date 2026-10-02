import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';

export type DropdownTriggerProps = Omit<
  PopoverPrimitive.Trigger.Props,
  'handle' | 'payload'
>;
