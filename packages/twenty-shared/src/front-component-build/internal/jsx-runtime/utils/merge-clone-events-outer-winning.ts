import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';

export const mergeCloneEventsOuterWinning = (
  innerCloneEvents: EventHandlersByPropName,
  outerCloneEvents: EventHandlersByPropName | null,
): EventHandlersByPropName =>
  Object.assign({}, innerCloneEvents, outerCloneEvents);
