import { type EventHandlerSource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlerSource';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';

export type EventRefProperties = {
  _eventHandlers: EventHandlersByPropName;
  _outerWinningCloneEvents: EventHandlersByPropName | null | undefined;
  _innerRef: UserRef;
  _eventSource: EventHandlerSource;
  _lastInnerRefReplacement?: EventRef;
};
