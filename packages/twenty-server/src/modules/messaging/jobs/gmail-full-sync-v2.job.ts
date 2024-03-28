import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailFullSyncV2Service } from 'src/modules/messaging/services/gmail-full-sync-v2/gmail-full-sync.v2.service';

export type GmailFullSyncV2JobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailFullSyncV2Job
  implements MessageQueueJob<GmailFullSyncV2JobData>
{
  private readonly logger = new Logger(GmailFullSyncV2Job.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly gmailFullSyncV2Service: GmailFullSyncV2Service,
  ) {}

  async handle(data: GmailFullSyncV2JobData): Promise<void> {
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
