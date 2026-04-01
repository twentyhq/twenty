import { isNonEmptyString } from '@sniptt/guards';
import deepEqual from 'deep-equal';

import {
  type DiscoveredMessageFolder,
  type MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export const computeFoldersToUpdate = ({
  discoveredFolders,
  existingFolders,
  externalIdToUuidMap,
}: {
  discoveredFolders: DiscoveredMessageFolder[];
  existingFolders: MessageFolder[];
  externalIdToUuidMap: Map<string, string>;
}): Map<string, Partial<MessageFolderWorkspaceEntity>> => {
  const existingFoldersByExternalId = new Map(
    existingFolders.map((folder) => [folder.externalId, folder]),
  );

  const foldersToUpdate = new Map<
    string,
    Partial<MessageFolderWorkspaceEntity>
  >();

  for (const discoveredFolder of discoveredFolders) {
    const existingFolder = existingFoldersByExternalId.get(
      discoveredFolder.externalId,
    );

    if (!existingFolder) {
      continue;
    }

    const resolvedParentFolderId = isNonEmptyString(
      discoveredFolder.parentFolderId,
    )
      ? (externalIdToUuidMap.get(discoveredFolder.parentFolderId) ?? null)
      : null;

    const discoveredFolderData = {
      name: discoveredFolder.name,
      isSentFolder: discoveredFolder.isSentFolder,
      parentFolderId: resolvedParentFolderId,
    };

    const existingFolderData = {
      name: existingFolder.name,
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
