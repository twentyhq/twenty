import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { chainCloneEvents } from '@/front-component-build/internal/jsx-runtime/utils/chain-clone-events';
import { createEventRef } from '@/front-component-build/internal/jsx-runtime/utils/create-event-ref';
import { getCloneUserRefWithElementJsxEventHandlers } from '@/front-component-build/internal/jsx-runtime/utils/get-clone-user-ref-with-element-jsx-event-handlers';
import { getOuterWinningCloneEventsOf } from '@/front-component-build/internal/jsx-runtime/utils/get-outer-winning-clone-events-of';
import { makeEventRef } from '@/front-component-build/internal/jsx-runtime/utils/make-event-ref';
import { mergeCloneEventsOuterWinning } from '@/front-component-build/internal/jsx-runtime/utils/merge-clone-events-outer-winning';
import { toNonEmptyCloneEventsOrNull } from '@/front-component-build/internal/jsx-runtime/utils/to-non-empty-clone-events-or-null';

export const makeCloneEventRefReplacingElementRef = ({
  innerCloneEventRef,
  cloneConfig,
  cloneEvents,
}: {
  innerCloneEventRef: EventRef;
  cloneConfig: ElementProps;
  cloneEvents: EventHandlersByPropName | null;
}): EventRef => {
  const eventHandlersSetByInnerClones =
    getOuterWinningCloneEventsOf(innerCloneEventRef);
  const cloneUserRef = getCloneUserRefWithElementJsxEventHandlers({
    elementRef: innerCloneEventRef,
    cloneConfig,
    eventHandlersSetByInnerClones,
  });
  const chainedCloneEvents = chainCloneEvents(
    innerCloneEventRef._eventHandlers,
    cloneEvents,
  );
  if (chainedCloneEvents === null) {
    return makeEventRef(null, cloneUserRef, 'clone');
  }

  const outerWinningCloneEvents = toNonEmptyCloneEventsOrNull(
    mergeCloneEventsOuterWinning(eventHandlersSetByInnerClones, cloneEvents),
  );
  return createEventRef(
    chainedCloneEvents,
    cloneUserRef,
    'clone',
    outerWinningCloneEvents,
  );
};
