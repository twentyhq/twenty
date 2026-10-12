import { type Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

export type TooltipHandle<TPayload = unknown> = InstanceType<
  typeof TooltipPrimitive.Handle<TPayload>
>;
