import {
  type DiscoveredMessageFolder,
  type MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { matchFolders } from './match-folders.util';

export const computeFolderIdsToDelete = ({
  discoveredFolders,
  existingFolders,
}: {
  discoveredFolders: DiscoveredMessageFolder[];
  existingFolders: MessageFolder[];
}): string[] => {
  const { toDelete } = matchFolders({ discoveredFolders, existingFolders });

  return toDelete;
};
