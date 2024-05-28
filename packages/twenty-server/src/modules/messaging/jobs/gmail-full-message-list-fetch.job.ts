import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailFullMessageListFetchService } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-message-list-fetch.service';

export type GmailFullMessageListFetchJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailFullMessageListFetchJob
  implements MessageQueueJob<GmailFullMessageListFetchJobData>
{
  private readonly logger = new Logger(GmailFullMessageListFetchJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly gmailFullSyncService: GmailFullMessageListFetchService,
  ) {}

  async handle(data: GmailFullMessageListFetchJobData): Promise<void> {
    this.logger.log(
      `gmail full-sync for workspace ${data.workspaceId} and account ${data.connectedAccountId}`,
    );

    try {
      await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
        data.workspaceId,
        data.connectedAccountId,
      );
    } catch (e) {
      this.logger.error(
        `Error refreshing access token for connected account ${data.connectedAccountId} in workspace ${data.workspaceId}`,
        e,
      );

      return;
    }

    await this.gmailFullSyncService.fetchConnectedAccountThreads(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
