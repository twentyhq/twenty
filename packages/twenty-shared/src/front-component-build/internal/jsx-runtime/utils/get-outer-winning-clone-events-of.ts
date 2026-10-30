import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';

export const getOuterWinningCloneEventsOf = (cloneEventRef: EventRef) =>
  cloneEventRef._outerWinningCloneEvents || cloneEventRef._eventHandlers;
