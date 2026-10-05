import { type MessageChannelMessageAssociationFolderAssociation } from 'src/modules/messaging/message-import-manager/types/message-channel-message-association-folder-association.type';

export type MessageFolderAssociationRecord = {
  messageChannelMessageAssociationId: string;
  messageFolderId: string;
};

const buildKey = ({
  messageChannelMessageAssociationId,
  messageFolderId,
}: MessageFolderAssociationRecord) =>
  `${messageChannelMessageAssociationId}:${messageFolderId}`;

export const buildMessageFolderAssociationsToInsert = ({
  associations,
  existingRecords,
}: {
  associations: MessageChannelMessageAssociationFolderAssociation[];
  existingRecords: MessageFolderAssociationRecord[];
}): MessageFolderAssociationRecord[] => {
  const keysToSkip = new Set(existingRecords.map(buildKey));

  const recordsToInsert: MessageFolderAssociationRecord[] = [];

  for (const association of associations) {
    for (const messageFolderId of association.messageFolderIds) {
      const record = {
        messageChannelMessageAssociationId:
          association.messageChannelMessageAssociationId,
        messageFolderId,
      };
      const key = buildKey(record);

      if (keysToSkip.has(key)) {
        continue;
      }

      keysToSkip.add(key);
      recordsToInsert.push(record);
    }
  }

  return recordsToInsert;
};
