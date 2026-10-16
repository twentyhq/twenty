import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';

export const eventRefWithoutHandlersByUserRefBySource: Record<
  EventHandlerSource,
  WeakMap<object, EventRef>
> = {
  jsx: new WeakMap(),
  clone: new WeakMap(),
};
