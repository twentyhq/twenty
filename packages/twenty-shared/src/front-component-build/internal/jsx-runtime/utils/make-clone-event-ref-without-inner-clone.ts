import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { getCloneUserRefWithElementJsxEventHandlers } from '@/front-component-build/internal/jsx-runtime/utils/get-clone-user-ref-with-element-jsx-event-handlers';
import { isEventRef } from '@/front-component-build/internal/jsx-runtime/utils/is-event-ref';
import { makeEventRef } from '@/front-component-build/internal/jsx-runtime/utils/make-event-ref';

export const makeCloneEventRefWithoutInnerClone = ({
  elementRef,
  cloneConfig,
  replacesElementRef,
  cloneEvents,
}: {
  elementRef: UserRef;
  cloneConfig: ElementProps;
  replacesElementRef: boolean;
  cloneEvents: EventHandlersByPropName | null;
}): EventRef => {
  const cloneUserRef = replacesElementRef
    ? getCloneUserRefWithElementJsxEventHandlers({
        elementRef,
        cloneConfig,
        eventHandlersSetByInnerClones: null,
      })
    : elementRef;
  const cloneAddsNoEventHandlers = cloneEvents === null;
  if (cloneAddsNoEventHandlers && isEventRef(cloneUserRef)) {
    return cloneUserRef;
  }

  return makeEventRef(cloneEvents, cloneUserRef, 'clone');
};
