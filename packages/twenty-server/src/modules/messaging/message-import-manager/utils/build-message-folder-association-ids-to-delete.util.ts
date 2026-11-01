import { isDefined } from 'twenty-shared/utils';

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

  const currentFolderIdsByAssociationId = new Map<string, Set<string>>();

  for (const association of associations) {
    if (
      !refreshedAssociationIds.has(
        association.messageChannelMessageAssociationId,
      )
    ) {
      continue;
    }

    const currentFolderIds =
      currentFolderIdsByAssociationId.get(
        association.messageChannelMessageAssociationId,
      ) ?? new Set<string>();

    for (const messageFolderId of association.messageFolderIds) {
      currentFolderIds.add(messageFolderId);
    }

    currentFolderIdsByAssociationId.set(
      association.messageChannelMessageAssociationId,
      currentFolderIds,
    );
  }

  return existingRecords
    .filter((existingRecord) => {
      const currentFolderIds = currentFolderIdsByAssociationId.get(
        existingRecord.messageChannelMessageAssociationId,
      );

      return (
        isDefined(currentFolderIds) &&
        currentFolderIds.size > 0 &&
        !currentFolderIds.has(existingRecord.messageFolderId)
      );
    })
    .map((existingRecord) => existingRecord.id);
};
