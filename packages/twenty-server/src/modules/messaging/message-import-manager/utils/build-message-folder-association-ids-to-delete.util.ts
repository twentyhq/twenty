import { type MessageChannelMessageAssociationFolderAssociation } from 'src/modules/messaging/message-import-manager/types/message-channel-message-association-folder-association.type';
import { type MessageFolderAssociationRecord } from 'src/modules/messaging/message-import-manager/utils/build-message-folder-associations-to-insert.util';

export const buildMessageFolderAssociationIdsToDelete = ({
  associations,
  existingRecords,
  refreshedMessageChannelMessageAssociationIds,
}: {
  associations: MessageChannelMessageAssociationFolderAssociation[];
  existingRecords: (MessageFolderAssociationRecord & { id: string })[];
  refreshedMessageChannelMessageAssociationIds: string[];
}): string[] => {
  const refreshedAssociationIds = new Set(
    refreshedMessageChannelMessageAssociationIds,
  );

  const currentRecordKeys = new Set(
    associations.flatMap(
      ({ messageChannelMessageAssociationId, messageFolderIds }) =>
        messageFolderIds.map(
          (messageFolderId) =>
            `${messageChannelMessageAssociationId}:${messageFolderId}`,
        ),
    ),
  );

  return existingRecords
    .filter(
      ({ messageChannelMessageAssociationId, messageFolderId }) =>
        refreshedAssociationIds.has(messageChannelMessageAssociationId) &&
        !currentRecordKeys.has(
          `${messageChannelMessageAssociationId}:${messageFolderId}`,
        ),
    )
    .map(({ id }) => id);
};
