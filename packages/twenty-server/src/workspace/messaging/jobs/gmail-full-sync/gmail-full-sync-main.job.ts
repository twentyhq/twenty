import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { GmailFullSyncService } from 'src/workspace/messaging/services/gmail/gmail-full-sync.service';
import { GmailRefreshAccessTokenService } from 'src/workspace/messaging/services/gmail/gmail-refresh-access-token.service';

export type GmailFullSyncMainJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailFullSyncMainJob
  implements MessageQueueJob<GmailFullSyncMainJobData>
{
  private readonly logger = new Logger(GmailFullSyncMainJob.name);

  constructor(
    private readonly gmailRefreshAccessTokenService: GmailRefreshAccessTokenService,
    private readonly gmailFullSyncService: GmailFullSyncService,
  ) {}

  async handle(data: GmailFullSyncMainJobData): Promise<void> {
    this.logger.log(
      `gmail full-sync for workspace ${data.workspaceId} and account ${data.connectedAccountId}`,
    );

    await this.gmailRefreshAccessTokenService.refreshAndSaveAccessToken(
      data.workspaceId,
      data.connectedAccountId,
    );

    await this.gmailFullSyncService.fetchConnectedAccountThreads(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
