import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { applyUserRef } from '@/front-component-build/internal/jsx-runtime/utils/apply-user-ref';
import { attachCloneEventRef } from '@/front-component-build/internal/jsx-runtime/utils/attach-clone-event-ref';
import { attachJsxEventRef } from '@/front-component-build/internal/jsx-runtime/utils/attach-jsx-event-ref';

export const createEventRef = (
  events: EventHandlersByPropName,
  userRef: UserRef,
  source: EventHandlerSource,
  outerWinningCloneEvents?: EventHandlersByPropName | null,
): EventRef => {
  function eventRef(element: EventTarget | null) {
    if (!element) {
      applyUserRef(userRef, element);
      return undefined;
    }

    const userRefCleanup =
      source === 'clone'
        ? attachCloneEventRef({
            element,
            events,
            userRef,
            outerWinningCloneEvents,
          })
        : attachJsxEventRef({ element, events, userRef });
    return typeof userRefCleanup === 'function' ? userRefCleanup : undefined;
  }

  return Object.assign(eventRef, {
    _eventHandlers: events,
    _outerWinningCloneEvents: outerWinningCloneEvents,
    _innerRef: userRef,
    _eventSource: source,
  });
};
