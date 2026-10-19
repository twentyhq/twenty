import { type EventHandlersBySource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersBySource';
import { type EventListenerDescriptor } from '@/front-component-build/internal/jsx-runtime/types/EventListenerDescriptor';
import { type EventListenerEntriesByKey } from '@/front-component-build/internal/jsx-runtime/types/EventListenerEntriesByKey';
import { type EventListenerEntry } from '@/front-component-build/internal/jsx-runtime/types/EventListenerEntry';
import { createElementEventListener } from '@/front-component-build/internal/jsx-runtime/utils/create-element-event-listener';

export const addEventListenerEntry = (
  element: EventTarget,
  listenerEntriesByKey: EventListenerEntriesByKey,
  listenerDescriptor: EventListenerDescriptor,
) => {
  const handlersBySource: EventHandlersBySource = {};
  const listenerEntry: EventListenerEntry = {
    type: listenerDescriptor.type,
    capture: listenerDescriptor.capture,
    handlersBySource,
    listener: createElementEventListener(handlersBySource),
  };
  listenerEntriesByKey[listenerDescriptor.key] = listenerEntry;
  element.addEventListener(
    listenerEntry.type,
    listenerEntry.listener,
    listenerEntry.capture,
  );
  return listenerEntry;
};
