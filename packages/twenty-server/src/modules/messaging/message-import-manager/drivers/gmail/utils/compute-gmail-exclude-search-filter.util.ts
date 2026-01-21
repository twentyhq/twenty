import { isDefined } from 'twenty-shared/utils';

import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-not-synced-labels';
import { buildGmailLabelSearchName } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-label-search-name.util';
import { computeGmailDefaultNotSyncedLabelsSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-default-not-synced-labels-search-filter';

export const computeGmailExcludeSearchFilter = (
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'externalId' | 'isSynced' | 'name' | 'parentFolderId'
  >[],
): string => {
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

  const defaultExclusions = MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS.map(
    computeGmailDefaultNotSyncedLabelsSearchFilter,
  ).join(' ');

  return `${inclusionQuery} ${defaultExclusions}`;
};
