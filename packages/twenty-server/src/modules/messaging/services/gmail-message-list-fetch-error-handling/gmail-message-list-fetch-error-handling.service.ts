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
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    switch (error?.code) {
      case 404:
        await this.handleNotFound(error, messageChannel, workspaceId);
        break;

      case 429:
        await this.handleRateLimitExceeded(error, messageChannel, workspaceId);
        break;

      case 403:
        if (
          error?.errors?.[0]?.reason === 'rateLimitExceeded' ||
          error?.errors?.[0]?.reason === 'userRateLimitExceeded'
        ) {
          await this.handleRateLimitExceeded(
            error,
            messageChannel,
            workspaceId,
          );
        } else {
          await this.handleInsufficientPermissions(
            error,
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
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `${error.code}: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccount.id}, import will be retried later.`,
    );

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
      `${error?.code}: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccount.id}`,
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

  public async handleNotFound(
    error: GmailError,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `404: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccount.id}.`,
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
  }
}
