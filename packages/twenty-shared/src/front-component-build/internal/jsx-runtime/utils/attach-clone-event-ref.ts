import { type CloneEventRefAttachment } from '@/front-component-build/internal/jsx-runtime/types/CloneEventRefAttachment';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { applyUserRef } from '@/front-component-build/internal/jsx-runtime/utils/apply-user-ref';
import { applyUserRefUnderCloneEventRefAttachment } from '@/front-component-build/internal/jsx-runtime/utils/apply-user-ref-under-clone-event-ref-attachment';
import { getCloneEventRefAttachmentOf } from '@/front-component-build/internal/jsx-runtime/utils/get-clone-event-ref-attachment-of';
import { registerElementEventHandlers } from '@/front-component-build/internal/jsx-runtime/utils/register-element-event-handlers';

export const attachCloneEventRef = ({
  element,
  events,
  userRef,
  outerWinningCloneEvents,
}: {
  element: EventTarget;
  events: EventHandlersByPropName;
  userRef: UserRef;
  outerWinningCloneEvents: EventHandlersByPropName | null | undefined;
}) => {
  const outerCloneEventRefAttachment = getCloneEventRefAttachmentOf(element);
  if (outerCloneEventRefAttachment !== null) {
    outerCloneEventRefAttachment.hasAttachedInnerCloneEventRef = true;
    return applyUserRef(userRef, element);
  }

  const attachment: CloneEventRefAttachment = {
    element,
    hasAttachedInnerCloneEventRef: false,
  };
  registerElementEventHandlers(element, events, 'clone');
  const userRefCleanup = applyUserRefUnderCloneEventRefAttachment(
    userRef,
    attachment,
  );

  const fallsBackToOuterWinningCloneEvents =
    !!outerWinningCloneEvents && !attachment.hasAttachedInnerCloneEventRef;
  if (fallsBackToOuterWinningCloneEvents) {
    registerElementEventHandlers(element, outerWinningCloneEvents, 'clone');
  }

  return userRefCleanup;
};
