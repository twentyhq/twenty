import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GmailFetchMessageContentFromCacheService } from 'src/modules/messaging/services/gmail-fetch-message-content-from-cache/gmail-fetch-message-content-from-cache.service';

export type GmailFetchMessageContentFromCacheJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class GmailFetchMessageContentFromCacheJob
  implements MessageQueueJob<GmailFetchMessageContentFromCacheJobData>
{
  private readonly logger = new Logger(
    GmailFetchMessageContentFromCacheJob.name,
  );

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly gmailFetchMessageContentFromCacheService: GmailFetchMessageContentFromCacheService,
  ) {}

  async handle(data: GmailFetchMessageContentFromCacheJobData): Promise<void> {
    await this.gmailFetchMessageContentFromCacheService.fetchMessageContentFromCache(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
