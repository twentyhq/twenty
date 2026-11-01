import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';

export type PopoverHandle<TPayload = unknown> = InstanceType<
  typeof PopoverPrimitive.Handle<TPayload>
>;
