import { isDefined } from 'twenty-shared/utils';

import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MESSAGING_GMAIL_DEFAULT_EXCLUDED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-excluded-labels.constant';
import { MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-system-labels.constant';
import { MESSAGING_GMAIL_FOLDERS_WITH_CATEGORY_EXCLUSIONS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-folders-with-category-exclusions.constant';
import { buildGmailLabelSearchName } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-label-search-name.util';
import { computeGmailDefaultNotSyncedLabelsSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-default-not-synced-labels-search-filter';

export const computeGmailExcludeSearchFilter = (
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'externalId' | 'isSynced' | 'name' | 'parentFolderId'
  >[],
  messageFolderImportPolicy: MessageFolderImportPolicy,
): string => {
  const allExclusions = MESSAGING_GMAIL_DEFAULT_EXCLUDED_LABELS.map(
    computeGmailDefaultNotSyncedLabelsSearchFilter,
  ).join(' ');

  const systemExclusions = MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS.map(
    computeGmailDefaultNotSyncedLabelsSearchFilter,
  ).join(' ');

  if (messageFolderImportPolicy === MessageFolderImportPolicy.ALL_FOLDERS) {
    return allExclusions;
  }

  const syncedFolders = messageFolders.filter((folder) => folder.isSynced);

  const allFoldersSynced =
    messageFolders.length > 0 &&
    messageFolders.every((folder) => folder.isSynced);

  if (allFoldersSynced) {
    return allExclusions;
  }

  const labelNamesToInclude = syncedFolders
    .map((folder) => buildGmailLabelSearchName(folder, messageFolders))
    .filter(isDefined);

  if (labelNamesToInclude.length === 0) {
    return '';
  }

  const inclusionQuery =
    labelNamesToInclude.length === 1
      ? `label:${labelNamesToInclude[0]}`
      : `(${labelNamesToInclude.map((name) => `label:${name}`).join(' OR ')})`;

  const hasCustomLabelSelected = syncedFolders.some(
    (folder) =>
      !MESSAGING_GMAIL_FOLDERS_WITH_CATEGORY_EXCLUSIONS.includes(
        folder.externalId ?? '',
      ),
  );

  if (hasCustomLabelSelected) {
    return `${inclusionQuery} ${systemExclusions}`;
  }

  return `${inclusionQuery} ${allExclusions}`;
};
