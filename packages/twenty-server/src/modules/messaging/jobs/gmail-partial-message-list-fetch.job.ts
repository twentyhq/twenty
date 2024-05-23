import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailPartialMessageListFetchService } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch.service';

export type GmailPartialMessageListFetchJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailPartialMessageListFetchJob
  implements MessageQueueJob<GmailPartialMessageListFetchJobData>
{
  private readonly logger = new Logger(GmailPartialMessageListFetchJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly gmailPartialSyncService: GmailPartialMessageListFetchService,
  ) {}

  async handle(data: GmailPartialMessageListFetchJobData): Promise<void> {
    this.logger.log(
      `gmail partial-sync for workspace ${data.workspaceId} and account ${data.connectedAccountId}`,
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

    await this.gmailPartialSyncService.fetchConnectedAccountThreads(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
