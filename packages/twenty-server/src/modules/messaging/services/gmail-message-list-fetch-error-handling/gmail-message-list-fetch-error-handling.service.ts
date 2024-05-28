import { Injectable, Logger } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import {
  MessageChannelSyncStatus,
  MessageChannelSyncSubStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { GmailError } from 'src/modules/messaging/types/gmail-error';

type MessageChannel = ObjectRecord<MessageChannelWorkspaceEntity> & {
  connectedAccountId: string;
};

@Injectable()
export class GmailMessageListFetchErrorHandlingService {
  private readonly logger = new Logger(
    GmailMessageListFetchErrorHandlingService.name,
  );

  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
  ) {}

  public async handleGmailError(
    error: GmailError | undefined,
    syncType: 'full' | 'partial',
    messageChannel: MessageChannel,
    workspaceId: string,
  ): Promise<void> {
    const reason = error?.errors?.[0]?.reason;

    switch (error?.code) {
      case 404:
        await this.handleNotFound(error, messageChannel, workspaceId);
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
        // refresh token
        break;

      default:
        break;
    }
  }

  public async handleRateLimitExceeded(
    error: GmailError,
    syncType: 'full' | 'partial',
    messageChannel: MessageChannel,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `${error.code}: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccountId}, import will be retried later.`,
    );

    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannel.id,
      syncType === 'full'
        ? MessageChannelSyncSubStatus.FULL_MESSAGES_LIST_FETCH_PENDING
        : MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
      workspaceId,
    );
  }

  public async handleInsufficientPermissions(
    error: GmailError,
    syncType: 'full' | 'partial',
    messageChannel: MessageChannel,
    workspaceId: string,
  ): Promise<void> {
    this.logger.error(
      `${error?.code}: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccountId}`,
    );
    await this.messageChannelRepository.updateSyncStatus(
      messageChannel.id,
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      workspaceId,
    );
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannel.id,
      syncType === 'full'
        ? MessageChannelSyncSubStatus.FULL_MESSAGES_LIST_FETCH_PENDING
        : MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
      workspaceId,
    );
    await this.connectedAccountRepository.updateAuthFailedAt(
      messageChannel.connectedAccountId,
      workspaceId,
    );
  }

  public async handleNotFound(
    error: GmailError,
    messageChannel: MessageChannel,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `404: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccountId}.`,
    );
    await this.messageChannelRepository.resetSyncCursor(
      messageChannel.id,
      workspaceId,
    );
    // remove nextPageToken from cache
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannel.id,
      MessageChannelSyncSubStatus.FULL_MESSAGES_LIST_FETCH_PENDING,
      workspaceId,
    );
  }
}
