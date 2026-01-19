import { isDefined } from 'twenty-shared/utils';

import { type MessageToImport } from 'src/modules/messaging/common/services/messaging-import-cache.service';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export const assignFolderIdsToMessages = (
  messages: MessageWithParticipants[],
  cachedMessages: MessageToImport[],
  messageFolders: MessageFolderWorkspaceEntity[] | null | undefined,
): void => {
  const messageExternalIdToFolderIds = new Map<string, string[]>();

  for (const { messageExternalId, folderId } of cachedMessages) {
    let existing = messageExternalIdToFolderIds.get(messageExternalId);

    if (!existing) {
      existing = [];
      messageExternalIdToFolderIds.set(messageExternalId, existing);
    }

    existing.push(folderId);
  }

  const folderExternalIdToInternalId = new Map(
    (messageFolders ?? [])
      .filter(
        (
          folder,
        ): folder is MessageFolderWorkspaceEntity & { externalId: string } =>
          isDefined(folder.externalId),
      )
      .map((folder) => [folder.externalId, folder.id]),
  );

  for (const message of messages) {
    const cachedFolderIds = messageExternalIdToFolderIds.get(
      message.externalId,
    );

    const validCachedFolderIds = cachedFolderIds?.filter(
      (id) => id !== '',
    );

    if (validCachedFolderIds?.length) {
      message.messageFolderIds = validCachedFolderIds;
      continue;
    }

    if (message.messageFolderExternalIds?.length) {
      message.messageFolderIds = message.messageFolderExternalIds
        .map((extId) => folderExternalIdToInternalId.get(extId))
        .filter(isDefined);
    }
  }
};
