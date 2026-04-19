import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageASsociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-aSsociation-message-folder.workspace-entity';
import { type MessageChannelMessageASsociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-aSsociation.workspace-entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

const BATCH_SIZE = 200;

@Injectable()
export class MessagingDeleteFolderMessagesService {
  private readonly logger = new Logger(
    MessagingDeleteFolderMessagesService.name,
  );

  constructor(
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async deleteFolderMessages(
    workspaceId: string,
    messageChannel: MessageChannelEntity,
    messageFolder: MessageFolderEntity,
  ): Promise<number> {
    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Deleting messages from folder: ${messageFolder.name}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    let totalDeletedCount = 0;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageFolderASsociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageASsociationMessageFolderWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageASsociationMessageFolder',
        );

      const messageChannelMessageASsociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageASsociationWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageASsociation',
        );

      let hasMoreData = true;

      while (hasMoreData) {
        const folderASsociations =
          await messageFolderASsociationRepository.find({
            where: {
              messageFolderId: messageFolder.id,
            },
            take: BATCH_SIZE,
          });

        if (folderASsociations.length === 0) {
          hasMoreData = false;
          continue;
        }

        const folderASsociationIds = folderASsociations.map(
          (folderASsociation) => folderASsociation.id,
        );

        const messageChannelMessageASsociationIds = folderASsociations.map(
          (folderASsociation) =>
            folderASsociation.messageChannelMessageASsociationId,
        );

        const aSsociations =
          await messageChannelMessageASsociationRepository.find({
            where: {
              id: In(messageChannelMessageASsociationIds),
              messageChannelId: messageChannel.id,
            },
          });

        const messageExternalIds = aSsociations
          .map((aSsociation) => aSsociation.messageExternalId)
          .filter(isDefined);

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Deleting ${messageExternalIds.length} messages`,
        );

        if (messageExternalIds.length > 0) {
          await this.messagingMessageCleanerService.deleteMessagesChannelMessageASsociationsAndRelatedOrphans(
            {
              workspaceId,
              messageExternalIds,
              messageChannelId: messageChannel.id,
            },
          );

          totalDeletedCount += messageExternalIds.length;
        }

        await messageFolderASsociationRepository.delete({
          id: In(folderASsociationIds),
        });
      }
    }, authContext);

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Completed deleting ${totalDeletedCount} messages from folder: ${messageFolder.name}`,
    );

    return totalDeletedCount;
  }
}
