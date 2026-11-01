import { eventListenerEntriesByElement } from '@/front-component-build/internal/jsx-runtime/states/event-listener-entries-by-element';
import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { getOrCreateEventListenerEntriesByKey } from '@/front-component-build/internal/jsx-runtime/utils/get-or-create-event-listener-entries-by-key';
import { removeStaleEventHandlersOfSource } from '@/front-component-build/internal/jsx-runtime/utils/remove-stale-event-handlers-of-source';
import { setEventHandlersOfSource } from '@/front-component-build/internal/jsx-runtime/utils/set-event-handlers-of-source';

export const registerElementEventHandlers = (
  element: EventTarget,
  events: EventHandlersByPropName,
  source: EventHandlerSource,
) => {
  const hasEventHandlers = Object.keys(events).length > 0;
  const isElementInListenerRegistry =
    eventListenerEntriesByElement.has(element);
  if (!hasEventHandlers && !isElementInListenerRegistry) {
    return;
  }

  const listenerEntriesByKey = getOrCreateEventListenerEntriesByKey(element);
  const currentListenerKeys = setEventHandlersOfSource({
    element,
    listenerEntriesByKey,
    events,
    source,
  });
  removeStaleEventHandlersOfSource({
    element,
    listenerEntriesByKey,
    currentListenerKeys,
    source,
  });
};
