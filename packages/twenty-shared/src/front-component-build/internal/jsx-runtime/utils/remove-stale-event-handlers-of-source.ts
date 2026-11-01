import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type EventListenerEntriesByKey } from '@/front-component-build/internal/jsx-runtime/types/EventListenerEntriesByKey';

export const removeStaleEventHandlersOfSource = ({
  element,
  listenerEntriesByKey,
  currentListenerKeys,
  source,
}: {
  element: EventTarget;
  listenerEntriesByKey: EventListenerEntriesByKey;
  currentListenerKeys: Record<string, boolean>;
  source: EventHandlerSource;
}) => {
  for (const [listenerKey, listenerEntry] of Object.entries(
    listenerEntriesByKey,
  )) {
    const isCurrentListener = !!currentListenerKeys[listenerKey];
    const hasHandlerOfSource = !!listenerEntry.handlersBySource[source];
    if (isCurrentListener || !hasHandlerOfSource) {
      continue;
    }

    delete listenerEntry.handlersBySource[source];
    const hasHandlerOfAnySource =
      !!listenerEntry.handlersBySource.jsx ||
      !!listenerEntry.handlersBySource.clone;
    if (hasHandlerOfAnySource) {
      continue;
    }

    delete listenerEntriesByKey[listenerKey];
    element.removeEventListener(
      listenerEntry.type,
      listenerEntry.listener,
      listenerEntry.capture,
    );
  }
};
