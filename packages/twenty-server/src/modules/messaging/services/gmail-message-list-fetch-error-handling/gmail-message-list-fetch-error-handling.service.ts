import { Injectable, Logger } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { SetMessageChannelSyncStatusService } from 'src/modules/messaging/services/set-message-channel-sync-status/set-message-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
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
    private readonly setMessageChannelSyncStatusService: SetMessageChannelSyncStatusService,
  ) {}

  public async handleGmailError(
    error: GmailError | undefined,
    syncType: 'full' | 'partial' | 'message-import',
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
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
            messageChannel,
            workspaceId,
          );
        }
        break;

      case 401:
        break;

      default:
        break;
    }
  }

  public async handleRateLimitExceeded(
    error: GmailError,
    syncType: 'full' | 'partial' | 'message-import',
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `${error.code}: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccountId}, import will be retried later.`,
    );

    // Add throttle logic here

    switch (syncType) {
      case 'full':
        await this.setMessageChannelSyncStatusService.setFullMessageListFetchPendingStatus(
          messageChannel.id,
          workspaceId,
        );
        break;

      case 'partial':
        await this.setMessageChannelSyncStatusService.setPartialMessageListFetchPendingStatus(
          messageChannel.id,
          workspaceId,
        );
        break;

      case 'message-import':
        await this.setMessageChannelSyncStatusService.setMessagesImportPendingStatus(
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
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    workspaceId: string,
  ): Promise<void> {
    this.logger.error(
      `${error?.code}: ${error.message} for workspace ${workspaceId} and account ${messageChannel.connectedAccountId}`,
    );
    await this.setMessageChannelSyncStatusService.setFailedInsufficientPermissionsStatus(
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
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
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
    await this.setMessageChannelSyncStatusService.setFullMessageListFetchPendingStatus(
      messageChannel.id,
      workspaceId,
    );
  }
}
