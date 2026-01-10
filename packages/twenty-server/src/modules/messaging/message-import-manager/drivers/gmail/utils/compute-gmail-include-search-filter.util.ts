import { isDefined } from 'twenty-shared/utils';

import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export const computeGmailIncludeSearchFilter = (
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'externalId' | 'isSynced'
  >[],
): string =>
  messageFolders
    .filter((folder) => folder.isSynced && isDefined(folder.externalId))
    .map((folder) => `label:${folder.externalId}`)
    .join(' OR ');
