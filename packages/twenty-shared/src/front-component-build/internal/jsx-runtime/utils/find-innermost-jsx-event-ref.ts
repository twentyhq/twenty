import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { isCloneEventRef } from '@/front-component-build/internal/jsx-runtime/utils/is-clone-event-ref';
import { isJsxEventRef } from '@/front-component-build/internal/jsx-runtime/utils/is-jsx-event-ref';

export const findInnermostJsxEventRef = (ref: UserRef): EventRef | null => {
  let innerRef = ref;
  while (isCloneEventRef(innerRef)) {
    innerRef = innerRef._innerRef;
  }

  if (isJsxEventRef(innerRef)) {
    return innerRef;
  }

  return null;
};
