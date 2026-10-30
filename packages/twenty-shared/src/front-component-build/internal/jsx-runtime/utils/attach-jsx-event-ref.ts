import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { applyUserRef } from '@/front-component-build/internal/jsx-runtime/utils/apply-user-ref';
import { getCloneEventRefAttachmentOf } from '@/front-component-build/internal/jsx-runtime/utils/get-clone-event-ref-attachment-of';
import { registerElementEventHandlers } from '@/front-component-build/internal/jsx-runtime/utils/register-element-event-handlers';

export const attachJsxEventRef = ({
  element,
  events,
  userRef,
}: {
  element: EventTarget;
  events: EventHandlersByPropName;
  userRef: UserRef;
}) => {
  registerElementEventHandlers(element, events, 'jsx');

  const isAttachedWithoutCloneEventRef =
    getCloneEventRefAttachmentOf(element) === null;
  if (isAttachedWithoutCloneEventRef) {
    registerElementEventHandlers(element, {}, 'clone');
  }

  return applyUserRef(userRef, element);
};
