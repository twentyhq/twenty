import { Injectable, Logger } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/services/message-channel-sync-status/message-channel-sync-status.service';
import { MessagingTelemetryService } from 'src/modules/messaging/services/telemetry/messaging-telemetry.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';

type SyncType = 'full' | 'partial' | 'message-import';

export type GmailError = {
  code: number;
  reason: string;
};

@Injectable()
export class GmailErrorHandlingService {
  private readonly logger = new Logger(GmailErrorHandlingService.name);

  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  public async handleGmailError(
    error: GmailError,
    syncType: SyncType,
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    const { code, reason } = error;

    switch (code) {
      case 400:
        if (reason === 'invalid_grant') {
          await this.handleInsufficientPermissions(
            error,
            syncType,
            messageChannel,
            workspaceId,
          );
        }
        break;
      case 404:
        await this.handleNotFound(error, syncType, messageChannel, workspaceId);
        break;

      case 429:
        await this.handleRateLimitExceeded(
          error,
          syncType,
          messageChannel,
          workspaceId,
        );
        break;

      case 403:
        if (
          reason === 'rateLimitExceeded' ||
          reason === 'userRateLimitExceeded'
        ) {
          await this.handleRateLimitExceeded(
            error,
            syncType,
            messageChannel,
            workspaceId,
          );
        } else {
          await this.handleInsufficientPermissions(
            error,
            syncType,
            messageChannel,
            workspaceId,
          );
        }
        break;

      case 401:
        await this.handleInsufficientPermissions(
          error,
          syncType,
          messageChannel,
          workspaceId,
        );
        break;

      default:
        await this.messageChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
          messageChannel.id,
          workspaceId,
        );
        break;
    }
  }

  public async handleRateLimitExceeded(
    error: GmailError,
    syncType: SyncType,
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingTelemetryService.track({
      eventName: `sync.${syncType}.error.rate_limit_exceeded`,
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `${error.code}: ${error.reason}`,
    });

    switch (syncType) {
      case 'full':
        await this.messageChannelSyncStatusService.scheduleFullMessageListFetch(
          messageChannel.id,
          workspaceId,
        );
        break;

      case 'partial':
        await this.messageChannelSyncStatusService.schedulePartialMessageListFetch(
          messageChannel.id,
          workspaceId,
        );
        break;

      case 'message-import':
        await this.messageChannelSyncStatusService.scheduleMessagesImport(
          messageChannel.id,
          workspaceId,
        );
        break;

      default:
        break;
    }
  }

  public async handleInsufficientPermissions(
    error: GmailError,
    syncType: SyncType,
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingTelemetryService.track({
      eventName: `sync.${syncType}.error.insufficient_permissions`,
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `${error.code}: ${error.reason}`,
    });

    await this.messageChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
      messageChannel.id,
      workspaceId,
    );

    await this.connectedAccountRepository.updateAuthFailedAt(
      messageChannel.connectedAccountId,
      workspaceId,
    );
  }

  public async handleNotFound(
    error: GmailError,
    syncType: SyncType,
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    if (syncType === 'message-import') {
      return;
    }

    await this.messagingTelemetryService.track({
      eventName: `sync.${syncType}.error.not_found`,
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `404: ${error.reason}`,
    });

    await this.messageChannelSyncStatusService.resetAndScheduleFullMessageListFetch(
      messageChannel.id,
      workspaceId,
    );
  }
}
