import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { findInnermostJsxEventRef } from '@/front-component-build/internal/jsx-runtime/utils/find-innermost-jsx-event-ref';
import { getJsxEventPropNamesOverriddenByClone } from '@/front-component-build/internal/jsx-runtime/utils/get-jsx-event-prop-names-overridden-by-clone';
import { makeEventRef } from '@/front-component-build/internal/jsx-runtime/utils/make-event-ref';
import { omitEventHandlers } from '@/front-component-build/internal/jsx-runtime/utils/omit-event-handlers';
import { replaceJsxEventRefInnerRef } from '@/front-component-build/internal/jsx-runtime/utils/replace-jsx-event-ref-inner-ref';

export const getCloneUserRefWithElementJsxEventHandlers = ({
  elementRef,
  cloneConfig,
  eventHandlersSetByInnerClones,
}: {
  elementRef: UserRef;
  cloneConfig: ElementProps;
  eventHandlersSetByInnerClones: EventHandlersByPropName | null;
}): UserRef => {
  const cloneUserRef = cloneConfig.ref;
  const elementJsxEventRef = findInnermostJsxEventRef(elementRef);
  if (elementJsxEventRef === null) {
    return cloneUserRef;
  }

  const elementJsxEventHandlers = elementJsxEventRef._eventHandlers;
  const jsxEventPropNamesOverriddenByClone =
    getJsxEventPropNamesOverriddenByClone({
      jsxEventHandlers: elementJsxEventHandlers,
      cloneConfig,
      eventHandlersSetByInnerClones,
    });
  if (jsxEventPropNamesOverriddenByClone.length === 0) {
    return replaceJsxEventRefInnerRef(elementJsxEventRef, cloneUserRef);
  }

  const remainingJsxEventHandlers = omitEventHandlers(
    elementJsxEventHandlers,
    jsxEventPropNamesOverriddenByClone,
  );
  const hasRemainingJsxEventHandlers =
    Object.keys(remainingJsxEventHandlers).length > 0;
  return makeEventRef(
    hasRemainingJsxEventHandlers ? remainingJsxEventHandlers : null,
    cloneUserRef,
    'jsx',
  );
};
