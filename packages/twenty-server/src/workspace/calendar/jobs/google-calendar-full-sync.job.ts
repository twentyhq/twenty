import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIsRefreshAccessTokenService } from 'src/workspace/calendar-and-messaging/services/google-apis-refresh-access-token.service';
import { GoogleCalendarFullSyncService } from 'src/workspace/calendar/services/google-calendar-full-sync.service';

export type GoogleCalendarFullSyncJobData = {
  workspaceId: string;
  connectedAccountId: string;
  nextPageToken?: string;
};

@Injectable()
export class GoogleCalendarFullSyncJob
  implements MessageQueueJob<GoogleCalendarFullSyncJobData>
{
  private readonly logger = new Logger(GoogleCalendarFullSyncJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIsRefreshAccessTokenService,
    private readonly googleCalendarFullSyncService: GoogleCalendarFullSyncService,
  ) {}

  async handle(data: GoogleCalendarFullSyncJobData): Promise<void> {
    this.logger.log(
      `google calendar full-sync for workspace ${
        data.workspaceId
      } and account ${data.connectedAccountId} ${
        data.nextPageToken ? `and ${data.nextPageToken} pageToken` : ''
      }`,
    );
    await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
      data.workspaceId,
      data.connectedAccountId,
    );

    await this.googleCalendarFullSyncService.startGoogleCalendarFullSync(
      data.workspaceId,
      data.connectedAccountId,
      data.nextPageToken,
    );
  }
}
