import { isDefined } from 'twenty-shared/utils';

import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-default-not-synced-labels';

export const getAllExcludedLabelIds = (
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'externalId' | 'isSynced'
  >[],
): string[] => {
  const userDisabledLabelIds = messageFolders
    .filter((folder) => !folder.isSynced && isDefined(folder.externalId))
    .map((folder) => folder.externalId!);

  return [...MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS, ...userDisabledLabelIds];
};
