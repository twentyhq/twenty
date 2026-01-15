import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetFolderMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-folder-messages.service';

const BATCH_SIZE = 200;
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
    private readonly gmailGetFolderMessagesService: GmailGetFolderMessagesService,
  ) {}

  async importFolderMessages(
    workspaceId: string,
    messageChannel: MessageChannelWorkspaceEntity,
    messageFolder: MessageFolderWorkspaceEntity,
  ): Promise<number> {
    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Starting folder import for: ${messageFolder.name}`,
    );

    const connectedAccount = messageChannel.connectedAccount;

    // Microsoft and IMAP already store sync cursors at the folder level,
    // so they work correctly without additional logic.
    // We only need special handling for Gmail.
    if (connectedAccount.provider !== ConnectedAccountProvider.GOOGLE) {
      this.logger.log(
        `WorkspaceId: ${workspaceId}, FolderId: ${messageFolder.id} - Provider ${connectedAccount.provider} does not require folder import, skipping`,
      );

      return 0;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    let totalQueuedCount = 0;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageExternalIds =
          await this.gmailGetFolderMessagesService.getMessageIdsFromFolder(
            connectedAccount,
            messageFolder,
          );

        this.logger.log(
          `WorkspaceId: ${workspaceId}, FolderId: ${messageFolder.id} - Found ${messageExternalIds.length} messages in folder`,
        );

        if (messageExternalIds.length === 0) {
          return;
        }

        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        const messageExternalIdsChunks = chunk(messageExternalIds, BATCH_SIZE);

        for (const [
          index,
          messageExternalIdsChunk,
        ] of messageExternalIdsChunks.entries()) {
          const existingAssociations =
            await messageChannelMessageAssociationRepository.find({
              where: {
                messageChannelId: messageChannel.id,
                messageExternalId: In(messageExternalIdsChunk),
              },
            });

          const existingExternalIds = existingAssociations.map(
            (association) => association.messageExternalId,
          );

          const messageExternalIdsToImport = messageExternalIdsChunk.filter(
            (externalId) => !existingExternalIds.includes(externalId),
          );

          if (messageExternalIdsToImport.length > 0) {
            this.logger.log(
              `WorkspaceId: ${workspaceId}, FolderId: ${messageFolder.id} - Queueing ${messageExternalIdsToImport.length} messages for import in batch ${index + 1}`,
            );

            const messageToFolderMapping: Record<string, string> = {};

            for (const messageExternalId of messageExternalIdsToImport) {
              messageToFolderMapping[messageExternalId] = messageFolder.id;
            }

            await this.cacheStorage.hSet(
              `messages-to-import:${workspaceId}:${messageChannel.id}`,
              messageToFolderMapping,
              ONE_WEEK_IN_MILLISECONDS,
            );

            totalQueuedCount += messageExternalIdsToImport.length;
          }
        }
      },
    );

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${messageFolder.id} - Completed folder import, queued ${totalQueuedCount} messages`,
    );

    return totalQueuedCount;
  }
}
