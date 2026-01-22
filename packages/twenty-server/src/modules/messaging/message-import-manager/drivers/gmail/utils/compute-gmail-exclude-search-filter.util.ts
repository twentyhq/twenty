import { isDefined } from 'twenty-shared/utils';

import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-not-synced-labels';
import { buildGmailLabelSearchName } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-label-search-name.util';
import { computeGmailDefaultNotSyncedLabelsSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-default-not-synced-labels-search-filter';

export const computeGmailExcludeSearchFilter = (
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'externalId' | 'isSynced' | 'name' | 'parentFolderId'
  >[],
  messageFolderImportPolicy: MessageFolderImportPolicy,
): string => {
  const defaultExclusions = MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS.map(
    computeGmailDefaultNotSyncedLabelsSearchFilter,
  ).join(' ');

  if (messageFolderImportPolicy === MessageFolderImportPolicy.ALL_FOLDERS) {
    return defaultExclusions;
  }

  const allFoldersSynced =
    messageFolders.length > 0 &&
    messageFolders.every((folder) => folder.isSynced);

  if (allFoldersSynced) {
    return defaultExclusions;
  }

  const labelNamesToInclude = messageFolders
    .filter((folder) => folder.isSynced)
    .map((folder) => buildGmailLabelSearchName(folder, messageFolders))
    .filter(isDefined);

  if (labelNamesToInclude.length === 0) {
    return '';
  }

  const inclusionQuery =
    labelNamesToInclude.length === 1
      ? `label:${labelNamesToInclude[0]}`
      : `(${labelNamesToInclude.map((name) => `label:${name}`).join(' OR ')})`;

  return `${inclusionQuery} ${defaultExclusions}`;
};
