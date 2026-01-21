import { isDefined } from 'twenty-shared/utils';

import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { buildGmailLabelSearchName } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-label-search-name.util';

export const computeGmailExcludeSearchFilter = (
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'externalId' | 'isSynced' | 'name' | 'parentFolderId'
  >[],
) =>
  messageFolders
    .filter((folder) => !folder.isSynced)
    .map((folder) => buildGmailLabelSearchName(folder, messageFolders))
    .filter(isDefined)
    .map((name) => `-label:${name}`)
    .join(' ');
