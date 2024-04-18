import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailFullSyncService } from 'src/modules/messaging/services/gmail-full-sync/gmail-full-sync.service';

export type GmailFullSyncJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailFullSyncJob implements MessageQueueJob<GmailFullSyncJobData> {
  private readonly logger = new Logger(GmailFullSyncJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly gmailFullSyncV2Service: GmailFullSyncService,
  ) {}

  async handle(data: GmailFullSyncJobData): Promise<void> {
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

    await this.gmailFullSyncV2Service.fetchConnectedAccountThreads(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
