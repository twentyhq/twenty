import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { createEventRef } from '@/front-component-build/internal/jsx-runtime/utils/create-event-ref';
import { getEventRefWithoutHandlers } from '@/front-component-build/internal/jsx-runtime/utils/get-event-ref-without-handlers';
import { getEventRefWithoutHandlersOrUserRef } from '@/front-component-build/internal/jsx-runtime/utils/get-event-ref-without-handlers-or-user-ref';

export const makeEventRef = (
  events: EventHandlersByPropName | null,
  userRef: UserRef,
  source: EventHandlerSource,
): EventRef => {
  if (events) {
    return createEventRef(events, userRef, source);
  }

  if (userRef == null) {
    return getEventRefWithoutHandlersOrUserRef(source);
  }

  return getEventRefWithoutHandlers(userRef, source);
};
