import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKeys } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { IsFeatureEnabledService } from 'src/engine/core-modules/feature-flag/services/is-feature-enabled.service';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';
import { MessagingErrorHandlingService } from 'src/modules/messaging/common/services/messaging-error-handling.service';
import { MessagingTelemetryService } from 'src/modules/messaging/common/services/messaging-telemetry.service';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-get-batch-size.constant';
import { MessagingGmailFetchMessagesByBatchesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-fetch-messages-by-batches.service';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { filterEmails } from 'src/modules/messaging/message-import-manager/utils/filter-emails.util';

@Injectable()
export class MessagingGmailMessagesImportService {
  private readonly logger = new Logger(
    MessagingGmailMessagesImportService.name,
  );

  constructor(
    private readonly fetchMessagesByBatchesService: MessagingGmailFetchMessagesByBatchesService,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messagingChannelSyncStatusService: MessagingChannelSyncStatusService,
    private readonly saveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly gmailErrorHandlingService: MessagingErrorHandlingService,
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly messagingTelemetryService: MessagingTelemetryService,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly emailAliasManagerService: EmailAliasManagerService,
    private readonly isFeatureEnabledService: IsFeatureEnabledService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
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

    await this.messagingChannelSyncStatusService.markAsMessagesImportOngoing(
      messageChannel.id,
      workspaceId,
    );

    let accessToken: string;

    try {
      accessToken =
        await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
          connectedAccount,
          workspaceId,
        );
    } catch (error) {
      await this.messagingTelemetryService.track({
        eventName: `refresh_token.error.insufficient_permissions`,
        workspaceId,
        connectedAccountId: messageChannel.connectedAccountId,
        messageChannelId: messageChannel.id,
        message: `${error.code}: ${error.reason}`,
      });

      await this.messagingChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
        messageChannel.id,
        workspaceId,
      );

      await this.connectedAccountRepository.updateAuthFailedAt(
        messageChannel.connectedAccountId,
        workspaceId,
      );

      return;
    }

    if (
      await this.isFeatureEnabledService.isFeatureEnabled(
        FeatureFlagKeys.IsMessagingAliasFetchingEnabled,
        workspaceId,
      )
    ) {
      try {
        await this.emailAliasManagerService.refreshEmailAliases(
          connectedAccount,
          workspaceId,
        );
      } catch (error) {
        await this.gmailErrorHandlingService.handleGmailError(
          {
            code: error.code,
            reason: error.message,
          },
          'messages-import',
          messageChannel,
          workspaceId,
        );
      }
    }

    const messageIdsToFetch =
      (await this.cacheStorage.setPop(
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
      )) ?? [];

    if (!messageIdsToFetch?.length) {
      await this.messagingChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
        messageChannel.id,
        workspaceId,
      );

      return await this.trackMessageImportCompleted(
        messageChannel,
        workspaceId,
      );
    }

    try {
      const allMessages =
        await this.fetchMessagesByBatchesService.fetchAllMessages(
          messageIdsToFetch,
          accessToken,
          connectedAccount.id,
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
        await this.messagingChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
          messageChannel.id,
          workspaceId,
        );
      } else {
        await this.messagingChannelSyncStatusService.scheduleMessagesImport(
          messageChannel.id,
          workspaceId,
        );
      }

      await this.messageChannelRepository.resetThrottleFailureCount(
        messageChannel.id,
        workspaceId,
      );

      await this.messageChannelRepository.resetSyncStageStartedAt(
        messageChannel.id,
        workspaceId,
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

      await this.gmailErrorHandlingService.handleGmailError(
        {
          code: error.code,
          reason: error.errors?.[0]?.reason,
        },
        'messages-import',
        messageChannel,
        workspaceId,
      );

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
