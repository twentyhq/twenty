import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailPartialMessageListFetchV2Service } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch-v2.service';
import {
  MessageChannelSyncSubStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { GmailFullMessageListFetchV2Service } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-message-list-fetch-v2.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { SetMessageChannelSyncStatusService } from 'src/modules/messaging/services/set-message-channel-sync-status/set-message-channel-sync-status.service';

export type GmailMessageListFetchJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailMessageListFetchJob
  implements MessageQueueJob<GmailMessageListFetchJobData>
{
  private readonly logger = new Logger(GmailMessageListFetchJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly gmailFullMessageListFetchV2Service: GmailFullMessageListFetchV2Service,
    private readonly gmailPartialMessageListFetchV2Service: GmailPartialMessageListFetchV2Service,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly setMessageChannelSyncStatusService: SetMessageChannelSyncStatusService,
  ) {}

  async handle(data: GmailMessageListFetchJobData): Promise<void> {
    const { workspaceId, connectedAccountId } = data;

    this.logger.log(
      `Fetch gmail message list for workspace ${workspaceId} and account ${connectedAccountId}`,
    );

    try {
      await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
        workspaceId,
        connectedAccountId,
      );
    } catch (e) {
      this.logger.error(
        `Error refreshing access token for connected account ${connectedAccountId} in workspace ${workspaceId}`,
        e,
      );

      return;
    }

    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      throw new Error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    const messageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!messageChannel) {
      throw new Error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      if (!connectedAccount.authFailedAt) {
        await this.connectedAccountRepository.updateAuthFailedAt(
          connectedAccountId,
          workspaceId,
        );
      }

      await this.setMessageChannelSyncStatusService.setFailedInsufficientPermissionsStatus(
        messageChannel.id,
        workspaceId,
      );

      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    switch (messageChannel.syncSubStatus) {
      case MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING:
        try {
          await this.gmailPartialMessageListFetchV2Service.processMessageListFetch(
            messageChannel,
            connectedAccount,
            workspaceId,
          );
        } catch (e) {
          this.logger.error(e);
        }

        return;

      case MessageChannelSyncSubStatus.FULL_MESSAGES_LIST_FETCH_PENDING:
        try {
          await this.gmailFullMessageListFetchV2Service.processMessageListFetch(
            messageChannel,
            connectedAccount,
            workspaceId,
          );
        } catch (e) {
          this.logger.error(e);
        }

        return;

      case MessageChannelSyncSubStatus.FAILED:
        this.logger.error(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} is in a failed state.`,
        );

        return;

      default:
        this.logger.error(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} is locked, import will be retried later.`,
        );

        return;
    }
  }
}
