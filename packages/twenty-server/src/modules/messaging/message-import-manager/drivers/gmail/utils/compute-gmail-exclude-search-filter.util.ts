import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { getAllExcludedLabelIds } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/get-all-excluded-label-ids.util';

export const computeGmailExcludeSearchFilter = (
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'externalId' | 'isSynced'
  >[],
) =>
  getAllExcludedLabelIds(messageFolders)
    .map((label) => `-label:${label}`)
    .join(' ');
