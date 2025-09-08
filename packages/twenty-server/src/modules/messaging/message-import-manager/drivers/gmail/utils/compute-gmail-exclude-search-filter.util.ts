import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export const computeGmailExcludeSearchFilter = (
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'externalId' | 'isSynced'
  >[],
) =>
  messageFolders
    .filter((folder) => !folder.isSynced)
    .map((folder) => `-label:${folder.externalId}`)
    .join(' ');
