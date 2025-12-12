import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-get-batch-size.constant';
import { MessagingAccountAuthenticationService } from 'src/modules/messaging/message-import-manager/services/messaging-account-authentication.service';
import { MessagingGetMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-get-messages.service';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { filterEmails } from 'src/modules/messaging/message-import-manager/utils/filter-emails.util';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

@Injectable()
export class MessagingMessagesImportService {
  private readonly logger = new Logger(MessagingMessagesImportService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly saveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly emailAliasManagerService: EmailAliasManagerService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messagingGetMessagesService: MessagingGetMessagesService,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messagingAccountAuthenticationService: MessagingAccountAuthenticationService,
  ) {}

  async processMessageBatchImport(
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    let messageIdsToFetch: string[] = [];

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        try {
          if (
            messageChannel.syncStage !==
            MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED
          ) {
            return;
          }

          await this.messagingMonitoringService.track({
            eventName: 'messages_import.started',
            workspaceId,
            connectedAccountId: messageChannel.connectedAccountId,
            messageChannelId: messageChannel.id,
          });

          await this.messageChannelSyncStatusService.markAsMessagesImportOngoing(
            [messageChannel.id],
            workspaceId,
          );

          const { accessToken, refreshToken } =
            await this.messagingAccountAuthenticationService.validateAndRefreshConnectedAccountAuthentication(
              {
                connectedAccount,
                workspaceId,
                messageChannelId: messageChannel.id,
              },
            );

          const connectedAccountWithFreshTokens = {
            ...connectedAccount,
            accessToken,
            refreshToken,
          };

          await this.emailAliasManagerService.refreshHandleAliases(
            connectedAccountWithFreshTokens,
            workspaceId,
          );

          messageIdsToFetch = await this.cacheStorage.setPop(
            `messages-to-import:${workspaceId}:${messageChannel.id}`,
            MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
          );

          if (!messageIdsToFetch?.length) {
            await this.messageChannelSyncStatusService.markAsCompletedAndMarkAsMessagesListFetchPending(
              [messageChannel.id],
              workspaceId,
            );

            return await this.trackMessageImportCompleted(
              messageChannel,
              workspaceId,
            );
          }

          const allMessages =
            await this.messagingGetMessagesService.getMessages(
              messageIdsToFetch,
              connectedAccountWithFreshTokens,
            );

          const blocklist =
            await this.blocklistRepository.getByWorkspaceMemberId(
              connectedAccountWithFreshTokens.accountOwnerId,
              workspaceId,
            );

          if (!isDefined(messageChannel.handle)) {
            throw new MessageImportDriverException(
              'Message channel handle is required',
              MessageImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
            );
          }

          if (!isDefined(connectedAccountWithFreshTokens.handleAliases)) {
            throw new MessageImportDriverException(
              'Message channel handle is required',
              MessageImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
            );
          }

          const messagesToSave = filterEmails(
            messageChannel.handle,
            [...connectedAccountWithFreshTokens.handleAliases.split(',')],
            allMessages,
            blocklist
              .map((blocklistItem) => blocklistItem.handle)
              .filter(isDefined),
            messageChannel.excludeGroupEmails,
          );

          if (messagesToSave.length > 0) {
            await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
              messagesToSave,
              messageChannel,
              connectedAccountWithFreshTokens,
              workspaceId,
            );
          }

          if (
            messageIdsToFetch.length <
            MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE
          ) {
            await this.messageChannelSyncStatusService.markAsCompletedAndMarkAsMessagesListFetchPending(
              [messageChannel.id],
              workspaceId,
            );
          } else {
            await this.messageChannelSyncStatusService.markAsMessagesImportPending(
              [messageChannel.id],
              workspaceId,
            );
          }

          const messageChannelRepository =
            await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
              workspaceId,
              'messageChannel',
            );

          await messageChannelRepository.update(
            {
              id: messageChannel.id,
            },
            {
              throttleFailureCount: 0,
              syncStageStartedAt: null,
            },
          );

          return await this.trackMessageImportCompleted(
            messageChannel,
            workspaceId,
          );
        } catch (error) {
          this.logger.error(
            `Error (${error.code}) importing messages for workspace ${workspaceId.slice(0, 8)} and account ${connectedAccount.id.slice(0, 8)}: ${error.message} - ${error.body}`,
          );
          await this.cacheStorage.setAdd(
            `messages-to-import:${workspaceId}:${messageChannel.id}`,
            messageIdsToFetch,
          );

          await this.messageImportErrorHandlerService.handleDriverException(
            error,
            MessageImportSyncStep.MESSAGES_IMPORT_ONGOING,
            messageChannel,
            workspaceId,
          );

          return await this.trackMessageImportCompleted(
            messageChannel,
            workspaceId,
          );
        }
      },
    );
  }

  private async trackMessageImportCompleted(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ) {
    await this.messagingMonitoringService.track({
      eventName: 'messages_import.completed',
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
    });
  }
}
