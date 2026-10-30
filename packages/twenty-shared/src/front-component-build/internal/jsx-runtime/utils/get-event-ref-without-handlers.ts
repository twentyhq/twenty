import { eventRefWithoutHandlersByUserRefBySource } from '@/front-component-build/internal/jsx-runtime/states/event-ref-without-handlers-by-user-ref-by-source';
import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { createEventRef } from '@/front-component-build/internal/jsx-runtime/utils/create-event-ref';

export const getEventRefWithoutHandlers = (
  userRef: NonNullable<UserRef>,
  source: EventHandlerSource,
) => {
  const eventRefByUserRef = eventRefWithoutHandlersByUserRefBySource[source];
  const memoizedEventRef = eventRefByUserRef.get(userRef);
  if (memoizedEventRef) {
    return memoizedEventRef;
  }

  const eventRef = createEventRef({}, userRef, source);
  eventRefByUserRef.set(userRef, eventRef);
  return eventRef;
};
