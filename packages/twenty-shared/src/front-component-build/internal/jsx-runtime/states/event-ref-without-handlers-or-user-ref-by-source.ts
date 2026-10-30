import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';

export const eventRefWithoutHandlersOrUserRefBySource: Partial<
  Record<EventHandlerSource, EventRef>
> = {};
