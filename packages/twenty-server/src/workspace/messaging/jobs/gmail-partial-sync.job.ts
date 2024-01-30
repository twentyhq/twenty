import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { GmailRefreshAccessTokenService } from 'src/workspace/messaging/services/gmail-refresh-access-token.service';
import { GmailPartialSyncService } from 'src/workspace/messaging/services/gmail-partial-sync.service';

export type GmailPartialSyncJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailPartialSyncJob
  implements MessageQueueJob<GmailPartialSyncJobData>
{
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly gmailRefreshAccessTokenService: GmailRefreshAccessTokenService,
    private readonly gmailPartialSyncService: GmailPartialSyncService,
  ) {}

  async handle(data: GmailPartialSyncJobData): Promise<void> {
    console.log(
      `gmail partial-sync for workspace ${data.workspaceId} and account ${
        data.connectedAccountId
      } with ${this.environmentService.getMessageQueueDriverType()}`,
    );
    await this.gmailRefreshAccessTokenService.refreshAndSaveAccessToken(
      data.workspaceId,
      data.connectedAccountId,
    );

    await this.gmailPartialSyncService.fetchConnectedAccountThreads(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
