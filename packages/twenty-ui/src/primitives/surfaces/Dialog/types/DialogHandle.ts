import { type Dialog as DialogPrimitive } from '@base-ui/react/dialog';

export type DialogHandle<TPayload = unknown> = InstanceType<
  typeof DialogPrimitive.Handle<TPayload>
>;
