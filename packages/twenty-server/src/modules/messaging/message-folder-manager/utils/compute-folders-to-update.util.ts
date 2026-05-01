import { isNonEmptyString } from '@sniptt/guards';
import { fastDeepEqual } from 'twenty-shared/utils';

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
}): Map<string, Partial<MessageFolderEntity>> => {
  const existingFoldersByExternalId = new Map(
    existingFolders.map((folder) => [folder.externalId, folder]),
  );

  const foldersToUpdate = new Map<string, Partial<MessageFolderEntity>>();

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
      isSentFolder: discoveredFolder.isSentFolder,
      isSynced: discoveredFolder.isSynced,
      parentFolderId,
    };

    const existingFolderData = {
      name: existingFolder.name,
      isSentFolder: existingFolder.isSentFolder,
      isSynced: existingFolder.isSynced,
      parentFolderId: isNonEmptyString(existingFolder.parentFolderId)
        ? existingFolder.parentFolderId
        : null,
    };

    if (!fastDeepEqual(discoveredFolderData, existingFolderData)) {
      const updatePayload: Partial<MessageFolderEntity> = {
        name: discoveredFolder.name,
        isSentFolder: discoveredFolder.isSentFolder,
        isSynced: discoveredFolder.isSynced,
        parentFolderId,
      };

      /**
       * Fix for issue #17095: When a folder is toggled back to synced
       * (isSynced: false → true), we must reset the syncCursor to null.
       * This forces the next import cycle to perform a full backfill of
       * historical messages instead of continuing from the stale cursor,
       * which would incorrectly skip all previously unsynced messages.
       */
      if (!existingFolder.isSynced && discoveredFolder.isSynced) {
        updatePayload.syncCursor = null;
      }

      foldersToUpdate.set(existingFolder.id, updatePayload);
    }
  }

  return foldersToUpdate;
};
