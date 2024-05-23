import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailPartialMessageListFetchV2Service } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch-v2.service';
import { GetConnectedAccountAndMessageChannelService } from 'src/modules/messaging/services/get-connected-account-and-message-channel/get-connected-account-and-message-channel.service';
import { MessageChannelSyncSubStatus } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { GmailFullMessageListFetchService } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-message-list-fetch.service';

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
    private readonly gmailFullSyncService: GmailFullMessageListFetchService,
    private readonly gmailPartialMessageListFetchV2Service: GmailPartialMessageListFetchV2Service,
    private readonly getConnectedAccountAndMessageChannelService: GetConnectedAccountAndMessageChannelService,
  ) {}

  async handle(data: GmailMessageListFetchJobData): Promise<void> {
    const { workspaceId, connectedAccountId } = data;

    this.logger.log(
      `gmail partial-sync for workspace ${workspaceId} and account ${connectedAccountId}`,
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

    const { messageChannel, connectedAccount } =
      await this.getConnectedAccountAndMessageChannelService.getConnectedAccountAndMessageChannelOrThrow(
        workspaceId,
        connectedAccountId,
      );

    switch (messageChannel.syncSubStatus) {
      case MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING:
        await this.gmailPartialMessageListFetchV2Service.processMessageListFetch(
          messageChannel,
          connectedAccount,
          workspaceId,
        );

        return;

      case MessageChannelSyncSubStatus.FULL_MESSAGES_LIST_FETCH_PENDING:
        await this.gmailFullSyncService.fetchConnectedAccountThreads(
          workspaceId,
          connectedAccountId,
        );

        return;

      default:
        throw new Error(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} is locked, import will be retried later.`,
        );
    }
  }
}
