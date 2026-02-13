import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
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
    messageChannel: MessageChannelWorkspaceEntity,
    messageFolder: MessageFolderWorkspaceEntity,
  ): Promise<number> {
    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Deleting messages from folder: ${messageFolder.name}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    let totalDeletedCount = 0;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageFolderAssociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationMessageFolderWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageAssociationMessageFolder',
        );

      const messageChannelMessageAssociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageAssociation',
        );

      let hasMoreData = true;

      while (hasMoreData) {
        const folderAssociations =
          await messageFolderAssociationRepository.find({
            where: {
              messageFolderId: messageFolder.id,
            },
            take: BATCH_SIZE,
          });

        if (folderAssociations.length === 0) {
          hasMoreData = false;
          continue;
        }

        const folderAssociationIds = folderAssociations.map(
          (folderAssociation) => folderAssociation.id,
        );

        const messageChannelMessageAssociationIds = folderAssociations.map(
          (folderAssociation) =>
            folderAssociation.messageChannelMessageAssociationId,
        );

        const associations =
          await messageChannelMessageAssociationRepository.find({
            where: {
              id: In(messageChannelMessageAssociationIds),
              messageChannelId: messageChannel.id,
            },
          });

        const messageExternalIds = associations
          .map((association) => association.messageExternalId)
          .filter(isDefined);

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Deleting ${messageExternalIds.length} messages`,
        );

        if (messageExternalIds.length > 0) {
          await this.messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
            {
              workspaceId,
              messageExternalIds,
              messageChannelId: messageChannel.id,
            },
          );

          totalDeletedCount += messageExternalIds.length;
        }

        await messageFolderAssociationRepository.delete({
          id: In(folderAssociationIds),
        });
      }
    }, authContext);

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Completed deleting ${totalDeletedCount} messages from folder: ${messageFolder.name}`,
    );

    return totalDeletedCount;
  }
}
