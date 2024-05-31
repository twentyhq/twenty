import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';
import {
  MessageChannelWorkspaceEntity,
  MessageChannelSyncSubStatus,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { createQueriesFromMessageIds } from 'src/modules/messaging/utils/create-queries-from-message-ids.util';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/constants/gmail-users-messages-get-batch-size.constant';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { SaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/services/gmail-messages-import/save-messages-and-enqueue-contact-creation.service';
import { GmailErrorHandlingService } from 'src/modules/messaging/services/gmail-error-handling/gmail-error-handling.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/services/message-channel-sync-status/message-channel-sync-status.service';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailMessagesImportService } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import.service';
import { MessagingTelemetryService } from 'src/modules/messaging/services/telemetry/messaging-telemetry.service';

@Injectable()
export class GmailMessagesImportV2Service {
  private readonly logger = new Logger(GmailMessagesImportService.name);

  constructor(
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly saveMessagesAndEnqueueContactCreationService: SaveMessagesAndEnqueueContactCreationService,
    private readonly gmailErrorHandlingService: GmailErrorHandlingService,
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  async processMessageBatchImport(
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
  ) {
    if (
      messageChannel.syncSubStatus !==
      MessageChannelSyncSubStatus.MESSAGES_IMPORT_PENDING
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
      workspaceId,
    );

    await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
      workspaceId,
      connectedAccount.id,
    );

    const messageIdsToFetch =
      (await this.cacheStorage.setPop(
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
      )) ?? [];

    if (!messageIdsToFetch?.length) {
      await this.messageChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
        messageChannel.id,
        workspaceId,
      );

      return await this.trackMessageImportCompleted(
        messageChannel,
        workspaceId,
      );
    }

    const messageQueries = createQueriesFromMessageIds(messageIdsToFetch);

    try {
      const messagesToSave =
        await this.fetchMessagesByBatchesService.fetchAllMessages(
          messageQueries,
          connectedAccount.accessToken,
          workspaceId,
          connectedAccount.id,
        );

      if (!messagesToSave.length) {
        await this.messageChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
          messageChannel.id,
          workspaceId,
        );

        return await this.trackMessageImportCompleted(
          messageChannel,
          workspaceId,
        );
      }

      await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreationJob(
        messagesToSave,
        messageChannel,
        connectedAccount,
        workspaceId,
      );

      if (messageIdsToFetch.length < GMAIL_USERS_MESSAGES_GET_BATCH_SIZE) {
        await this.messageChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
          messageChannel.id,
          workspaceId,
        );
      } else {
        await this.messageChannelSyncStatusService.scheduleMessagesImport(
          messageChannel.id,
          workspaceId,
        );
      }

      return await this.trackMessageImportCompleted(
        messageChannel,
        workspaceId,
      );
    } catch (error) {
      await this.cacheStorage.setAdd(
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        messageIdsToFetch,
      );

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
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
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
