import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { GmailRefreshAccessTokenService } from 'src/workspace/messaging/services/gmail-refresh-access-token.service';
import { GmailFullSyncService } from 'src/workspace/messaging/services/gmail-full-sync.service';

export type GmailFullSyncJobData = {
  workspaceId: string;
  connectedAccountId: string;
  nextPageToken?: string;
};

@Injectable()
export class GmailFullSyncJob implements MessageQueueJob<GmailFullSyncJobData> {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly gmailRefreshAccessTokenService: GmailRefreshAccessTokenService,
    private readonly fetchWorkspaceMessagesService: GmailFullSyncService,
  ) {}

  async handle(data: GmailFullSyncJobData): Promise<void> {
    console.log(
      `gmail full-sync for workspace ${data.workspaceId} and account ${
        data.connectedAccountId
      } ${
        data.nextPageToken ? `and ${data.nextPageToken} pageToken` : ''
      } with ${this.environmentService.getMessageQueueDriverType()}`,
    );
    await this.gmailRefreshAccessTokenService.refreshAndSaveAccessToken(
      data.workspaceId,
      data.connectedAccountId,
    );

    await this.fetchWorkspaceMessagesService.fetchConnectedAccountThreads(
      data.workspaceId,
      data.connectedAccountId,
      data.nextPageToken,
    );
  }
}
