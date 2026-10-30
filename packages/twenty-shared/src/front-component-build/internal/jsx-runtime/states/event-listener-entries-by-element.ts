import { type EventListenerEntriesByKey } from '@/front-component-build/internal/jsx-runtime/types/EventListenerEntriesByKey';

export const eventListenerEntriesByElement = new WeakMap<
  EventTarget,
  EventListenerEntriesByKey
>();
