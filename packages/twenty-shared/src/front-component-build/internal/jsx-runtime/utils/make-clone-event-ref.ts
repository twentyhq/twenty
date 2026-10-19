import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { isCloneEventRef } from '@/front-component-build/internal/jsx-runtime/utils/is-clone-event-ref';
import { makeCloneEventRefKeepingElementRef } from '@/front-component-build/internal/jsx-runtime/utils/make-clone-event-ref-keeping-element-ref';
import { makeCloneEventRefReplacingElementRef } from '@/front-component-build/internal/jsx-runtime/utils/make-clone-event-ref-replacing-element-ref';
import { makeCloneEventRefWithoutInnerClone } from '@/front-component-build/internal/jsx-runtime/utils/make-clone-event-ref-without-inner-clone';

export const makeCloneEventRef = ({
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
  if (!isCloneEventRef(elementRef)) {
    return makeCloneEventRefWithoutInnerClone({
      elementRef,
      cloneConfig,
      replacesElementRef,
      cloneEvents,
    });
  }

  if (replacesElementRef) {
    return makeCloneEventRefReplacingElementRef({
      innerCloneEventRef: elementRef,
      cloneConfig,
      cloneEvents,
    });
  }

  return makeCloneEventRefKeepingElementRef({
    innerCloneEventRef: elementRef,
    cloneEvents,
  });
};
