import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';

export const toNonEmptyCloneEventsOrNull = (
  cloneEvents: EventHandlersByPropName,
) => (Object.keys(cloneEvents).length > 0 ? cloneEvents : null);
