import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { IsFeatureEnabledService } from 'src/engine/core-modules/feature-flag/services/is-feature-enabled.service';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { RefreshAccessTokenService } from 'src/modules/connected-account/refresh-access-token-manager/services/refresh-access-token.service';
import { RefreshAccessTokenErrorCode } from 'src/modules/connected-account/refresh-access-token-manager/types/refresh-access-token-error.type';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-get-batch-size.constant';
import { MessagingGetMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-get-messages.service';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { MessagingErrorCode } from 'src/modules/messaging/message-import-manager/types/messaging-error.type';
import { filterEmails } from 'src/modules/messaging/message-import-manager/utils/filter-emails.util';
import { MessagingTelemetryService } from 'src/modules/messaging/monitoring/services/messaging-telemetry.service';

@Injectable()
export class MessagingMessagesImportService {
  private readonly logger = new Logger(MessagingMessagesImportService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly saveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly refreshAccessTokenService: RefreshAccessTokenService,
    private readonly messagingTelemetryService: MessagingTelemetryService,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly emailAliasManagerService: EmailAliasManagerService,
    private readonly isFeatureEnabledService: IsFeatureEnabledService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingGetMessagesService: MessagingGetMessagesService,
  ) {}

  async processMessageBatchImport(
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    if (
      messageChannel.syncStage !==
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING
    ) {
      return;
    }

    await this.messagingTelemetryService.track({
      eventName: 'messages_import.started',
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
    });

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} starting...`,
    );

    await this.messageChannelSyncStatusService.markAsMessagesImportOngoing(
      messageChannel.id,
    );

    try {
      connectedAccount.accessToken =
        await this.refreshAccessTokenService.refreshAndSaveAccessToken(
          connectedAccount,
          workspaceId,
        );
    } catch (error) {
      switch (error.code) {
        case (RefreshAccessTokenErrorCode.REFRESH_ACCESS_TOKEN_FAILED,
        RefreshAccessTokenErrorCode.REFRESH_TOKEN_NOT_FOUND):
          await this.messagingTelemetryService.track({
            eventName: `refresh_token.error.insufficient_permissions`,
            workspaceId,
            connectedAccountId: messageChannel.connectedAccountId,
            messageChannelId: messageChannel.id,
            message: `${error.code}: ${error.reason}`,
          });
          throw {
            code: MessagingErrorCode.INSUFFICIENT_PERMISSIONS,
            message: error.message,
          };
        case RefreshAccessTokenErrorCode.PROVIDER_NOT_SUPPORTED:
          throw {
            code: MessagingErrorCode.PROVIDER_NOT_SUPPORTED,
            message: error.message,
          };
        default:
          throw error;
      }
    }

    if (
      await this.isFeatureEnabledService.isFeatureEnabled(
        FeatureFlagKey.IsMessagingAliasFetchingEnabled,
        workspaceId,
      )
    ) {
      await this.emailAliasManagerService.refreshHandleAliases(
        connectedAccount,
        workspaceId,
      );
    }

    const messageIdsToFetch =
      (await this.cacheStorage.setPop(
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
      )) ?? [];

    if (!messageIdsToFetch?.length) {
      await this.messageChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
        messageChannel.id,
      );

      return await this.trackMessageImportCompleted(
        messageChannel,
        workspaceId,
      );
    }

    try {
      const allMessages = await this.messagingGetMessagesService.getMessages(
        messageIdsToFetch,
        connectedAccount,
        workspaceId,
      );

      const blocklist = await this.blocklistRepository.getByWorkspaceMemberId(
        connectedAccount.accountOwnerId,
        workspaceId,
      );

      const messagesToSave = filterEmails(
        messageChannel.handle,
        allMessages,
        blocklist.map((blocklistItem) => blocklistItem.handle),
      );

      await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreationJob(
        messagesToSave,
        messageChannel,
        connectedAccount,
        workspaceId,
      );

      if (
        messageIdsToFetch.length < MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE
      ) {
        await this.messageChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
          messageChannel.id,
        );
      } else {
        await this.messageChannelSyncStatusService.scheduleMessagesImport(
          messageChannel.id,
        );
      }

      const messageChannelRepository =
        await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
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
      this.logger.log(
        `Messaging import for messageId ${
          error.messageId
        }, workspace ${workspaceId} and connected account ${
          connectedAccount.id
        } failed with error: ${JSON.stringify(error)}`,
      );

      await this.cacheStorage.setAdd(
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        messageIdsToFetch,
      );

      if (error.code === undefined) {
        // This should never happen as all errors must be known
        throw error;
      }

      return await this.trackMessageImportCompleted(
        messageChannel,
        workspaceId,
      );
    }
  }

  private async trackMessageImportCompleted(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ) {
    await this.messagingTelemetryService.track({
      eventName: 'messages_import.completed',
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
    });
  }
}
