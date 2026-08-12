import {
  type DiscoveredMessageFolder,
  type MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { canonicalizeFolderExternalId } from 'src/modules/messaging/message-folder-manager/utils/canonicalize-folder-external-id.util';

export const computeFolderIdsToDelete = ({
  discoveredFolders,
  existingFolders,
}: {
  discoveredFolders: DiscoveredMessageFolder[];
  existingFolders: MessageFolder[];
}): string[] => {
  const discoveredExternalIds = new Set(
    discoveredFolders.map((discoveredFolder) =>
      canonicalizeFolderExternalId(discoveredFolder.externalId),
    ),
  );

  return existingFolders
    .filter(
      (existingFolder) =>
        !discoveredExternalIds.has(
          canonicalizeFolderExternalId(existingFolder.externalId),
        ),
    )
    .map((existingFolder) => existingFolder.id);
};
