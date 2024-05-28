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

@Injectable()
export class GmailPartialMessageListFetchErrorHandlingService {
  private readonly logger = new Logger(
    GmailPartialMessageListFetchErrorHandlingService.name,
  );

  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
  ) {}

  public async handleGmailError(
    error: GmailError | undefined,
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    switch (error?.code) {
      case 404:
        this.logger.log(
          `404: Invalid lastSyncHistoryId for workspace ${workspaceId} and account ${connectedAccountId}, falling back to full sync.`,
        );
        await this.messageChannelRepository.resetSyncCursor(
          messageChannel.id,
          workspaceId,
        );
        await this.messageChannelRepository.updateSyncSubStatus(
          messageChannel.id,
          MessageChannelSyncSubStatus.FULL_MESSAGES_LIST_FETCH_PENDING,
          workspaceId,
        );
        break;

      case 429:
        this.logger.log(
          `429: rate limit reached for workspace ${workspaceId} and account ${connectedAccountId}: ${error.message}, import will be retried later.`,
        );
        await this.handleRateLimitExceeded(messageChannel, workspaceId);
        break;

      case 403:
        if (
          error?.errors?.[0]?.reason === 'rateLimitExceeded' ||
          error?.errors?.[0]?.reason === 'userRateLimitExceeded'
        ) {
          this.logger.log(
            `403:${
              error?.errors?.[0]?.reason === 'userRateLimitExceeded' && ' user'
            } rate limit exceeded for workspace ${workspaceId} and account ${connectedAccountId}: ${
              error.message
            }, import will be retried later.`,
          );
          this.handleRateLimitExceeded(messageChannel, workspaceId);
        } else {
          await this.handleInsufficientPermissions(
            error,
            messageChannel,
            workspaceId,
          );
        }
        break;

      case 401:
        this.handleInsufficientPermissions(error, messageChannel, workspaceId);
        break;

      default:
        break;
    }
  }

  public async handleRateLimitExceeded(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannel.id,
      MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
      workspaceId,
    );
  }

  public async handleInsufficientPermissions(
    error: GmailError,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.error(
      `{error?.code}: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccount.id}`,
    );
    await this.messageChannelRepository.updateSyncStatus(
      messageChannel.id,
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      workspaceId,
    );
    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannel.id,
      MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
      workspaceId,
    );
    await this.connectedAccountRepository.updateAuthFailedAt(
      messageChannel.connectedAccount.id,
      workspaceId,
    );
  }
}
