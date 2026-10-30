import { cloneEventRefAttachmentState } from '@/front-component-build/internal/jsx-runtime/states/clone-event-ref-attachment-state';
import { type CloneEventRefAttachment } from '@/front-component-build/internal/jsx-runtime/types/CloneEventRefAttachment';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';
import { applyUserRef } from '@/front-component-build/internal/jsx-runtime/utils/apply-user-ref';

export const applyUserRefUnderCloneEventRefAttachment = (
  userRef: UserRef,
  attachment: CloneEventRefAttachment,
) => {
  const previousCloneEventRefAttachment = cloneEventRefAttachmentState.current;
  cloneEventRefAttachmentState.current = attachment;
  try {
    return applyUserRef(userRef, attachment.element);
  } finally {
    cloneEventRefAttachmentState.current = previousCloneEventRefAttachment;
  }
};
