import { isNonEmptyString } from '@sniptt/guards';

import {
  type DiscoveredMessageFolder,
  type MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

import { matchFolders } from './match-folders.util';

export const computeFoldersToCreate = ({
  discoveredFolders,
  existingFolders,
  messageChannelId,
}: {
  discoveredFolders: DiscoveredMessageFolder[];
  existingFolders: MessageFolder[];
  messageChannelId: string;
}): Partial<MessageFolderEntity>[] => {
  const { toCreate } = matchFolders({ discoveredFolders, existingFolders });

  return toCreate.map((discoveredFolder) => ({
    name: discoveredFolder.name,
    externalId: discoveredFolder.externalId,
    messageChannelId,
    isSentFolder: discoveredFolder.isSentFolder,
    isSynced: discoveredFolder.isSynced,
    syncCursor: null,
    parentFolderId: isNonEmptyString(discoveredFolder.parentFolderId)
      ? discoveredFolder.parentFolderId
      : null,
  }));
};
