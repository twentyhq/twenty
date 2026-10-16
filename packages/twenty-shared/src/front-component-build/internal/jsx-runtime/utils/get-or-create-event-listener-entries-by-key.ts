import { eventListenerEntriesByElement } from '@/front-component-build/internal/jsx-runtime/states/event-listener-entries-by-element';
import { type EventListenerEntriesByKey } from '@/front-component-build/internal/jsx-runtime/types/EventListenerEntriesByKey';

export const getOrCreateEventListenerEntriesByKey = (element: EventTarget) => {
  const existingListenerEntriesByKey =
    eventListenerEntriesByElement.get(element);
  if (existingListenerEntriesByKey) {
    return existingListenerEntriesByKey;
  }

  const listenerEntriesByKey: EventListenerEntriesByKey = {};
  eventListenerEntriesByElement.set(element, listenerEntriesByKey);
  return listenerEntriesByKey;
};
