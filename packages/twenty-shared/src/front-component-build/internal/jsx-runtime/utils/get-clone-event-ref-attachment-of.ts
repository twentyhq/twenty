import { cloneEventRefAttachmentState } from '@/front-component-build/internal/jsx-runtime/states/clone-event-ref-attachment-state';

export const getCloneEventRefAttachmentOf = (element: EventTarget) => {
  const cloneEventRefAttachment = cloneEventRefAttachmentState.current;
  const isCloneEventRefAttachingElement =
    cloneEventRefAttachment !== null &&
    cloneEventRefAttachment.element === element;
  return isCloneEventRefAttachingElement ? cloneEventRefAttachment : null;
};
