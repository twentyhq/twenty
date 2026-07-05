import { MESSAGING_GMAIL_EXCLUDED_CATEGORY_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-category-labels.constant';
import { MESSAGING_GMAIL_FOLDERS_WITH_CATEGORY_EXCLUSIONS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-folders-with-category-exclusions.constant';

export const isGmailMessageInSyncedFolder = (
  messageLabelIds: string[],
  syncedFolderExternalIds: string[],
): boolean => {
  const messageIsInAtLeastOneSyncedFolder = messageLabelIds.some((labelId) =>
    syncedFolderExternalIds.includes(labelId),
  );

  if (!messageIsInAtLeastOneSyncedFolder) {
    return false;
  }

  const messageIsInSyncedCustomFolder = messageLabelIds.some(
    (labelId) =>
      syncedFolderExternalIds.includes(labelId) &&
      !MESSAGING_GMAIL_FOLDERS_WITH_CATEGORY_EXCLUSIONS.includes(labelId),
  );

  if (messageIsInSyncedCustomFolder) {
    return true;
  }

  const messageHasExcludedCategoryLabel = messageLabelIds.some((labelId) =>
    MESSAGING_GMAIL_EXCLUDED_CATEGORY_LABELS.includes(labelId),
  );

  return !messageHasExcludedCategoryLabel;
};
