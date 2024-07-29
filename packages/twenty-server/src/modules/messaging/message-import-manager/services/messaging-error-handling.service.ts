import { Injectable } from '@nestjs/common';

import snakeCase from 'lodash.snakecase';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MESSAGING_THROTTLE_MAX_ATTEMPTS } from 'src/modules/messaging/message-import-manager/constants/messaging-throttle-max-attempts';
import { MessagingTelemetryService } from 'src/modules/messaging/monitoring/services/messaging-telemetry.service';

type SyncStep =
  | 'partial-message-list-fetch'
  | 'full-message-list-fetch'
  | 'messages-import';

export type GmailError = {
  code: number | string;
  reason: string;
};

@Injectable()
export class MessagingErrorHandlingService {
  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly messagingChannelSyncStatusService: MessagingChannelSyncStatusService,
    private readonly messagingTelemetryService: MessagingTelemetryService,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
  ) {}

  public async handleGmailError(
    error: GmailError,
    syncStep: SyncStep,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const { code, reason } = error;

    switch (code) {
      case 400:
        if (reason === 'invalid_grant') {
          await this.handleInsufficientPermissions(
            error,
            syncStep,
            messageChannel,
            workspaceId,
          );
        }
        if (reason === 'failedPrecondition') {
          await this.handleFailedPrecondition(
            error,
            syncStep,
            messageChannel,
            workspaceId,
          );
        } else {
          await this.handleUnknownError(
            error,
            syncStep,
            messageChannel,
            workspaceId,
          );
        }
        break;
      case 404:
        await this.handleNotFound(error, syncStep, messageChannel, workspaceId);
        break;

      case 429:
        await this.handleRateLimitExceeded(
          error,
          syncStep,
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
            syncStep,
            messageChannel,
            workspaceId,
          );
        } else {
          await this.handleInsufficientPermissions(
            error,
            syncStep,
            messageChannel,
            workspaceId,
          );
        }
        break;

      case 401:
        await this.handleInsufficientPermissions(
          error,
          syncStep,
          messageChannel,
          workspaceId,
        );
        break;
      case 500:
        if (reason === 'backendError') {
          await this.handleRateLimitExceeded(
            error,
            syncStep,
            messageChannel,
            workspaceId,
          );
        } else {
          await this.messagingChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
            messageChannel.id,
            workspaceId,
          );
          throw new Error(
            `Unhandled Gmail error code ${code} with reason ${reason}`,
          );
        }
        break;
      case 'ECONNRESET':
      case 'ENOTFOUND':
      case 'ECONNABORTED':
      case 'ETIMEDOUT':
      case 'ERR_NETWORK':
        // We are currently mixing up Gmail Error code (HTTP status) and axios error code (ECONNRESET)

        // In case of a network error, we should retry the request
        await this.handleRateLimitExceeded(
          error,
          syncStep,
          messageChannel,
          workspaceId,
        );
        break;
      default:
        await this.messagingChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
          messageChannel.id,
          workspaceId,
        );
        throw new Error(
          `Unhandled Gmail error code ${code} with reason ${reason}`,
        );
    }
  }

  private async handleRateLimitExceeded(
    error: GmailError,
    syncStep: SyncStep,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingTelemetryService.track({
      eventName: `${snakeCase(syncStep)}.error.rate_limit_exceeded`,
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `${error.code}: ${error.reason}`,
    });

    await this.handleThrottle(syncStep, messageChannel, workspaceId);
  }

  private async handleFailedPrecondition(
    error: GmailError,
    syncStep: SyncStep,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingTelemetryService.track({
      eventName: `${snakeCase(syncStep)}.error.failed_precondition`,
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `${error.code}: ${error.reason}`,
    });

    await this.handleThrottle(syncStep, messageChannel, workspaceId);
  }

  private async handleInsufficientPermissions(
    error: GmailError,
    syncStep: SyncStep,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingTelemetryService.track({
      eventName: `${snakeCase(syncStep)}.error.insufficient_permissions`,
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `${error.code}: ${error.reason}`,
    });

    await this.messagingChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
      messageChannel.id,
      workspaceId,
    );

    if (!messageChannel.connectedAccountId) {
      throw new Error(
        `Connected account ID is not defined for message channel ${messageChannel.id} in workspace ${workspaceId}`,
      );
    }

    await this.connectedAccountRepository.updateAuthFailedAt(
      messageChannel.connectedAccountId,
      workspaceId,
    );
  }

  private async handleNotFound(
    error: GmailError,
    syncStep: SyncStep,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    if (syncStep === 'messages-import') {
      return;
    }

    await this.messagingTelemetryService.track({
      eventName: `${snakeCase(syncStep)}.error.not_found`,
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `404: ${error.reason}`,
    });

    await this.messagingChannelSyncStatusService.resetAndScheduleFullMessageListFetch(
      messageChannel.id,
      workspaceId,
    );
  }

  private async handleThrottle(
    syncStep: SyncStep,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    if (
      messageChannel.throttleFailureCount >= MESSAGING_THROTTLE_MAX_ATTEMPTS
    ) {
      await this.messagingChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
        messageChannel.id,
        workspaceId,
      );

      return;
    }

    await this.throttle(messageChannel, workspaceId);

    switch (syncStep) {
      case 'full-message-list-fetch':
        await this.messagingChannelSyncStatusService.scheduleFullMessageListFetch(
          messageChannel.id,
          workspaceId,
        );
        break;

      case 'partial-message-list-fetch':
        await this.messagingChannelSyncStatusService.schedulePartialMessageListFetch(
          messageChannel.id,
          workspaceId,
        );
        break;

      case 'messages-import':
        await this.messagingChannelSyncStatusService.scheduleMessagesImport(
          messageChannel.id,
          workspaceId,
        );
        break;

      default:
        break;
    }
  }

  private async throttle(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelRepository.incrementThrottleFailureCount(
      messageChannel.id,
      workspaceId,
    );

    await this.messagingTelemetryService.track({
      eventName: 'message_channel.throttle',
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `Increment throttle failure count to ${messageChannel.throttleFailureCount}`,
    });
  }

  private async handleUnknownError(
    error: GmailError,
    syncStep: SyncStep,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingTelemetryService.track({
      eventName: `${snakeCase(syncStep)}.error.unknown`,
      workspaceId,
      connectedAccountId: messageChannel.connectedAccountId,
      messageChannelId: messageChannel.id,
      message: `${error.code}: ${error.reason}`,
    });

    await this.messagingChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
      messageChannel.id,
      workspaceId,
    );

    throw new Error(
      `Unhandled Gmail error code ${error.code} with reason ${error.reason}`,
    );
  }
}
