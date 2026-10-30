import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { createEventRef } from '@/front-component-build/internal/jsx-runtime/utils/create-event-ref';

export const replaceJsxEventRefInnerRef = (
  jsxEventRef: EventRef,
  innerRef: UserRef,
): EventRef => {
  const lastInnerRefReplacement = jsxEventRef._lastInnerRefReplacement;
  const canReuseLastInnerRefReplacement =
    lastInnerRefReplacement !== undefined &&
    lastInnerRefReplacement._innerRef === innerRef;
  if (canReuseLastInnerRefReplacement) {
    return lastInnerRefReplacement;
  }

  const innerRefReplacement = createEventRef(
    jsxEventRef._eventHandlers,
    innerRef,
    'jsx',
  );
  jsxEventRef._lastInnerRefReplacement = innerRefReplacement;
  return innerRefReplacement;
};
