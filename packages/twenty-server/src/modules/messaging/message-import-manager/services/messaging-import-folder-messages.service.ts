import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';

const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class MessagingImportFolderMessagesService {
  private readonly logger = new Logger(
    MessagingImportFolderMessagesService.name,
  );

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly gmailGetMessageListService: GmailGetMessageListService,
  ) {}

  async importFolderMessages(
    workspaceId: string,
    messageChannel: MessageChannelWorkspaceEntity,
    messageFolder: MessageFolderWorkspaceEntity,
  ): Promise<number> {
    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Importing messages for folder: ${messageFolder.name}`,
    );

    if (
      messageChannel.connectedAccount.provider !==
      ConnectedAccountProvider.GOOGLE
    ) {
      this.logger.log(
        `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Skipping FOLDER_IMPORT for non-Gmail provider: ${messageChannel.connectedAccount.provider}`,
      );

      return 0;
    }

    if (!isDefined(messageFolder.externalId)) {
      this.logger.warn(
        `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Folder has no externalId, skipping import`,
      );

      return 0;
    }

    const messageExternalIds =
      await this.gmailGetMessageListService.getMessageListForLabel(
        messageChannel.connectedAccount,
        messageFolder.externalId,
      );

    if (messageExternalIds.length === 0) {
      this.logger.log(
        `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - No messages found in folder`,
      );

      return 0;
    }

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Found ${messageExternalIds.length} messages in folder`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        let totalMessagesToImportCount = 0;
        const messageExternalIdsChunks = chunk(messageExternalIds, 200);

        for (const [
          index,
          messageExternalIdsChunk,
        ] of messageExternalIdsChunks.entries()) {
          const existingMessageChannelMessageAssociations =
            await messageChannelMessageAssociationRepository.find({
              where: {
                messageChannelId: messageChannel.id,
                messageExternalId: In(messageExternalIdsChunk),
              },
            });

          const existingMessageChannelMessageAssociationsExternalIds =
            existingMessageChannelMessageAssociations.map(
              (messageChannelMessageAssociation) =>
                messageChannelMessageAssociation.messageExternalId,
            );

          const messageExternalIdsToImport = messageExternalIdsChunk.filter(
            (messageExternalId) =>
              !existingMessageChannelMessageAssociationsExternalIds.includes(
                messageExternalId,
              ),
          );

          if (messageExternalIdsToImport.length > 0) {
            this.logger.log(
              `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Adding ${messageExternalIdsToImport.length} message external ids to import in batch ${index + 1}`,
            );

            totalMessagesToImportCount += messageExternalIdsToImport.length;

            await this.cacheStorage.setAdd(
              `messages-to-import:${workspaceId}:${messageChannel.id}`,
              messageExternalIdsToImport,
              ONE_WEEK_IN_MILLISECONDS,
            );
          }
        }

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Completed importing ${totalMessagesToImportCount} new messages from folder: ${messageFolder.name}`,
        );

        return totalMessagesToImportCount;
      },
    );
  }
}
