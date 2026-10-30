import { type EventHandler } from '@/front-component-build/internal/jsx-runtime/types/EventHandler';
import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';

export type EventHandlersBySource = Partial<
  Record<EventHandlerSource, EventHandler>
>;
