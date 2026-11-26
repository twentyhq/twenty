import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MessageChannelMessageAssociationFolderAssociation } from 'src/modules/messaging/message-import-manager/types/message-channel-message-association-folder-association.type';

export type MessageFolderAssociationRecord = {
  messageChannelMessageAssociationId: string;
  messageFolderId: string;
};

type MessageFolderAssociationRecordToInsert = MessageFolderAssociationRecord & {
  createdBy?: ActorMetadata;
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
}): MessageFolderAssociationRecordToInsert[] => {
  const keysToSkip = new Set(existingRecords.map(buildKey));

  const recordsToInsert: MessageFolderAssociationRecordToInsert[] = [];

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
      recordsToInsert.push({
        ...record,
        ...(isDefined(association.createdBy)
          ? { createdBy: association.createdBy }
          : {}),
      });
    }
  }

  return recordsToInsert;
};
