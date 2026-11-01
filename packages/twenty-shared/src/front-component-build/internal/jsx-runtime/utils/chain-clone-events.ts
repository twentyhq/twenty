import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { chainEventHandlers } from '@/front-component-build/internal/jsx-runtime/utils/chain-event-handlers';
import { toNonEmptyCloneEventsOrNull } from '@/front-component-build/internal/jsx-runtime/utils/to-non-empty-clone-events-or-null';

export const chainCloneEvents = (
  innerCloneEvents: EventHandlersByPropName,
  outerCloneEvents: EventHandlersByPropName | null,
) => {
  const chainedCloneEvents: EventHandlersByPropName = Object.assign(
    {},
    innerCloneEvents,
  );
  const outerCloneEventsOrEmpty: EventHandlersByPropName =
    outerCloneEvents ?? {};
  for (const [eventPropName, outerHandler] of Object.entries(
    outerCloneEventsOrEmpty,
  )) {
    const innerHandler = innerCloneEvents[eventPropName];
    chainedCloneEvents[eventPropName] = innerHandler
      ? chainEventHandlers(innerHandler, outerHandler)
      : outerHandler;
  }
  return toNonEmptyCloneEventsOrNull(chainedCloneEvents);
};
