import {
  type DiscoveredMessageFolder,
  type MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

export const computeFolderIdsToDelete = ({
  discoveredFolders,
  existingFolders,
}: {
  discoveredFolders: DiscoveredMessageFolder[];
  existingFolders: MessageFolder[];
}): string[] => {
  const discoveredExternalIds = new Set(
    discoveredFolders.map((discoveredFolder) => discoveredFolder.externalId),
  );

  return existingFolders
    .filter(
      (existingFolder) => !discoveredExternalIds.has(existingFolder.externalId),
    )
    .map((existingFolder) => existingFolder.id);
};
