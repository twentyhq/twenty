import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';

@Injectable()
export class MessagingDeleteFolderMessagesService {
  private readonly logger = new Logger(
    MessagingDeleteFolderMessagesService.name,
  );

  constructor(
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
    private readonly messagingGetMessageListService: MessagingGetMessageListService,
  ) {}

  async deleteFolderMessages(
    workspaceId: string,
    messageChannel: MessageChannelWorkspaceEntity,
    messageFolder: MessageFolderWorkspaceEntity,
  ): Promise<number> {
    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Deleting messages from folder: ${messageFolder.name}`,
    );

    const messageLists =
      await this.messagingGetMessageListService.getMessageLists(
        messageChannel,
        [messageFolder],
      );

    let totalDeletedCount = 0;

    for (const messageList of messageLists) {
      const { messageExternalIds } = messageList;

      if (messageExternalIds.length === 0) {
        continue;
      }

      const messageExternalIdsChunks = chunk(messageExternalIds, 200);

      for (const messageExternalIdsChunk of messageExternalIdsChunks) {
        const validExternalIds = messageExternalIdsChunk.filter(isDefined);

        if (validExternalIds.length === 0) {
          continue;
        }

        await this.messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
          {
            workspaceId,
            messageExternalIds: validExternalIds,
            messageChannelId: messageChannel.id,
          },
        );

        totalDeletedCount += validExternalIds.length;

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Processed ${validExternalIds.length} message deletions`,
        );
      }
    }

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Completed deleting ${totalDeletedCount} messages from folder: ${messageFolder.name}`,
    );

    return totalDeletedCount;
  }
}
