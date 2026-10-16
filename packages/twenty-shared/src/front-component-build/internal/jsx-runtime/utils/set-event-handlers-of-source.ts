import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type EventListenerEntriesByKey } from '@/front-component-build/internal/jsx-runtime/types/EventListenerEntriesByKey';
import { addEventListenerEntry } from '@/front-component-build/internal/jsx-runtime/utils/add-event-listener-entry';
import { toEventListenerDescriptor } from '@/front-component-build/internal/jsx-runtime/utils/to-event-listener-descriptor';

export const setEventHandlersOfSource = ({
  element,
  listenerEntriesByKey,
  events,
  source,
}: {
  element: EventTarget;
  listenerEntriesByKey: EventListenerEntriesByKey;
  events: EventHandlersByPropName;
  source: EventHandlerSource;
}) => {
  const currentListenerKeys: Record<string, boolean> = {};
  for (const eventPropName in events) {
    const listenerDescriptor = toEventListenerDescriptor({
      eventPropName,
      element,
    });
    currentListenerKeys[listenerDescriptor.key] = true;
    const listenerEntry =
      listenerEntriesByKey[listenerDescriptor.key] ||
      addEventListenerEntry(element, listenerEntriesByKey, listenerDescriptor);
    listenerEntry.handlersBySource[source] = events[eventPropName];
  }
  return currentListenerKeys;
};
