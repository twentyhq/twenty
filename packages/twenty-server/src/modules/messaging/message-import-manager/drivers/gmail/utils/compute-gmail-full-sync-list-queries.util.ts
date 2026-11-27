import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { MessageFolderImportPolicy } from 'twenty-shared/types';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MESSAGING_GMAIL_DEFAULT_EXCLUDED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-excluded-labels.constant';
import { MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-system-labels.constant';
import { MESSAGING_GMAIL_FOLDERS_WITH_CATEGORY_EXCLUSIONS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-folders-with-category-exclusions.constant';
import { computeGmailDefaultNotSyncedLabelsSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-default-not-synced-labels-search-filter';

export const computeGmailFullSyncListQueries = ({
  messageFolders,
  messageFolderImportPolicy,
}: {
  messageFolders: Pick<MessageFolderEntity, 'externalId' | 'isSynced'>[];
  messageFolderImportPolicy: MessageFolderImportPolicy;
}): { labelIds?: string[]; searchFilter: string }[] => {
  const allExclusions = MESSAGING_GMAIL_DEFAULT_EXCLUDED_LABELS.map(
    computeGmailDefaultNotSyncedLabelsSearchFilter,
  ).join(' ');

  const systemExclusions = MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS.map(
    computeGmailDefaultNotSyncedLabelsSearchFilter,
  ).join(' ');

  const areAllFoldersSynced =
    isNonEmptyArray(messageFolders) &&
    messageFolders.every((folder) => folder.isSynced);

  if (
    messageFolderImportPolicy === MessageFolderImportPolicy.ALL_FOLDERS ||
    areAllFoldersSynced
  ) {
    return [{ searchFilter: allExclusions }];
  }

  const syncedFolders = messageFolders.filter((folder) => folder.isSynced);

  const syncedLabelIds = syncedFolders
    .map((folder) => folder.externalId)
    .filter(isNonEmptyString);

  const hasCustomLabelSelected = syncedFolders.some(
    (folder) =>
      !MESSAGING_GMAIL_FOLDERS_WITH_CATEGORY_EXCLUSIONS.includes(
        folder.externalId ?? '',
      ),
  );

  const searchFilter = hasCustomLabelSelected
    ? systemExclusions
    : allExclusions;

  return syncedLabelIds.map((labelId) => ({
    labelIds: [labelId],
    searchFilter,
  }));
};
