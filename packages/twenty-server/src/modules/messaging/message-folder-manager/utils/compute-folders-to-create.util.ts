import { isNonEmptyString } from '@sniptt/guards';

import {
  type DiscoveredMessageFolder,
  type MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { canonicalizeFolderExternalId } from 'src/modules/messaging/message-folder-manager/utils/canonicalize-folder-external-id.util';

export const computeFoldersToCreate = ({
  discoveredFolders,
  existingFolders,
  messageChannelId,
}: {
  discoveredFolders: DiscoveredMessageFolder[];
  existingFolders: MessageFolder[];
  messageChannelId: string;
}): Partial<MessageFolderEntity>[] => {
  const existingFolderExternalIds = new Set(
    existingFolders.map((folder) =>
      canonicalizeFolderExternalId(folder.externalId),
    ),
  );

  return discoveredFolders
    .filter(
      (discoveredFolder) =>
        !existingFolderExternalIds.has(
          canonicalizeFolderExternalId(discoveredFolder.externalId),
        ),
    )
    .map((discoveredFolder) => ({
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
