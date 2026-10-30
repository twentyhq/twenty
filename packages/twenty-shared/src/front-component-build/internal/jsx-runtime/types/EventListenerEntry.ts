import { type EventHandlersBySource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersBySource';

export type EventListenerEntry = {
  type: string;
  capture: boolean;
  handlersBySource: EventHandlersBySource;
  listener: (this: unknown, event: Event) => void;
};
