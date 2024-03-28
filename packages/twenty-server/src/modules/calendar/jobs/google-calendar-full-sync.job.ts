import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GoogleCalendarFullSyncService } from 'src/modules/calendar/services/google-calendar-full-sync.service';

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
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
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

    await this.googleCalendarFullSyncService.startGoogleCalendarFullSync(
      data.workspaceId,
      data.connectedAccountId,
      data.nextPageToken,
    );
  }
}
