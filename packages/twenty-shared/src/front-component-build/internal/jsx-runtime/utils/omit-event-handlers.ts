import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';

export const omitEventHandlers = (
  eventHandlers: EventHandlersByPropName,
  omittedEventPropNames: string[],
) => {
  const remainingEventHandlers: EventHandlersByPropName = {};
  for (const [eventPropName, eventHandler] of Object.entries(eventHandlers)) {
    const isOmitted = omittedEventPropNames.includes(eventPropName);
    if (!isOmitted) {
      remainingEventHandlers[eventPropName] = eventHandler;
    }
  }
  return remainingEventHandlers;
};
