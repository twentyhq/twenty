import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { createEventRef } from '@/front-component-build/internal/jsx-runtime/utils/create-event-ref';
import { getOuterWinningCloneEventsOf } from '@/front-component-build/internal/jsx-runtime/utils/get-outer-winning-clone-events-of';
import { makeEventRef } from '@/front-component-build/internal/jsx-runtime/utils/make-event-ref';
import { mergeCloneEventsOuterWinning } from '@/front-component-build/internal/jsx-runtime/utils/merge-clone-events-outer-winning';
import { toNonEmptyCloneEventsOrNull } from '@/front-component-build/internal/jsx-runtime/utils/to-non-empty-clone-events-or-null';

export const makeCloneEventRefKeepingElementRef = ({
  innerCloneEventRef,
  cloneEvents,
}: {
  innerCloneEventRef: EventRef;
  cloneEvents: EventHandlersByPropName | null;
}): EventRef => {
  if (cloneEvents === null) {
    return innerCloneEventRef;
  }

  const outerWinningCloneEvents = toNonEmptyCloneEventsOrNull(
    mergeCloneEventsOuterWinning(
      getOuterWinningCloneEventsOf(innerCloneEventRef),
      cloneEvents,
    ),
  );
  const hasInnerOuterWinningCloneEvents =
    innerCloneEventRef._outerWinningCloneEvents != null;
  if (!hasInnerOuterWinningCloneEvents) {
    return makeEventRef(
      outerWinningCloneEvents,
      innerCloneEventRef._innerRef,
      'clone',
    );
  }

  return createEventRef(
    mergeCloneEventsOuterWinning(
      innerCloneEventRef._eventHandlers,
      cloneEvents,
    ),
    innerCloneEventRef._innerRef,
    'clone',
    outerWinningCloneEvents,
  );
};
