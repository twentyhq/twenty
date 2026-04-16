import { isNonEmptyString } from '@sniptt/guards';
import deepEqual from 'deep-equal';

import {
  type DiscoveredMessageFolder,
  type MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

export const computeFoldersToUpdate = ({
  discoveredFolders,
  existingFolders,
}: {
  discoveredFolders: DiscoveredMessageFolder[];
  existingFolders: MessageFolder[];
}): Map<
  string,
  Pick<
    MessageFolderEntity,
    'name' | 'isSynced' | 'isSentFolder' | 'parentFolderId'
  >
> => {
  const existingFoldersByExternalId = new Map(
    existingFolders.map((folder) => [folder.externalId, folder]),
  );

  const foldersToUpdate = new Map<
    string,
    Pick<
      MessageFolderEntity,
      'name' | 'isSynced' | 'isSentFolder' | 'parentFolderId'
    >
  >();

  for (const discoveredFolder of discoveredFolders) {
    const existingFolder = existingFoldersByExternalId.get(
      discoveredFolder.externalId,
    );

    if (!existingFolder) {
      continue;
    }

    const parentFolderId = isNonEmptyString(discoveredFolder.parentFolderId)
      ? discoveredFolder.parentFolderId
      : null;

    const discoveredFolderData = {
      name: discoveredFolder.name,
      isSynced: discoveredFolder.isSynced,
      isSentFolder: discoveredFolder.isSentFolder,
      parentFolderId,
    };

    const existingFolderData = {
      name: existingFolder.name,
      isSynced: existingFolder.isSynced,
      isSentFolder: existingFolder.isSentFolder,
      parentFolderId: isNonEmptyString(existingFolder.parentFolderId)
        ? existingFolder.parentFolderId
        : null,
    };

    if (!deepEqual(discoveredFolderData, existingFolderData)) {
      foldersToUpdate.set(existingFolder.id, discoveredFolderData);
    }
  }

  return foldersToUpdate;
};
