import { eventRefWithoutHandlersOrUserRefBySource } from '@/front-component-build/internal/jsx-runtime/states/event-ref-without-handlers-or-user-ref-by-source';
import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { createEventRef } from '@/front-component-build/internal/jsx-runtime/utils/create-event-ref';

export const getEventRefWithoutHandlersOrUserRef = (
  source: EventHandlerSource,
) => {
  const memoizedEventRef = eventRefWithoutHandlersOrUserRefBySource[source];
  if (memoizedEventRef) {
    return memoizedEventRef;
  }

  const eventRef = createEventRef({}, null, source);
  eventRefWithoutHandlersOrUserRefBySource[source] = eventRef;
  return eventRef;
};
