import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import {
  MessageFolderPendingSyncAction,
  type MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export const computeUpdatedFolders = ({
  existingFolders,
  foldersToUpdate,
  folderIdsToDelete,
}: {
  existingFolders: MessageFolder[];
  foldersToUpdate: Map<string, Partial<MessageFolderWorkspaceEntity>>;
  folderIdsToDelete: string[];
}): MessageFolder[] => {
  return existingFolders.map((existingFolder) => {
    const update = foldersToUpdate.get(existingFolder.id);
    const isMarkedForDeletion = folderIdsToDelete.includes(existingFolder.id);

    const pendingSyncAction = isMarkedForDeletion
      ? MessageFolderPendingSyncAction.FOLDER_DELETION
      : MessageFolderPendingSyncAction.NONE;

    if (update) {
      return {
        ...existingFolder,
        ...update,
        pendingSyncAction,
      };
    }

    return {
      ...existingFolder,
      pendingSyncAction,
    };
  });
};
