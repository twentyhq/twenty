import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIsRefreshAccessTokenService } from 'src/workspace/calendar-and-messaging/services/google-apis-refresh-access-token.service';
import { GmailPartialSyncService } from 'src/workspace/messaging/services/gmail-partial-sync.service';

export type GmailPartialSyncJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailPartialSyncJob
  implements MessageQueueJob<GmailPartialSyncJobData>
{
  private readonly logger = new Logger(GmailPartialSyncJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIsRefreshAccessTokenService,
    private readonly gmailPartialSyncService: GmailPartialSyncService,
  ) {}

  async handle(data: GmailPartialSyncJobData): Promise<void> {
    this.logger.log(
      `gmail partial-sync for workspace ${data.workspaceId} and account ${data.connectedAccountId}`,
    );
    await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
      data.workspaceId,
      data.connectedAccountId,
    );

    await this.gmailPartialSyncService.fetchConnectedAccountThreads(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
