//
import { Injectable, Logger } from '@nestjs/common';

import { type GaxiosError } from 'gaxios';
import { google, type calendar_v3 as calendarV3 } from 'googleapis';

import { formatGoogleCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/format-google-calendar-event.util';
import { parseGaxiosError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/parse-gaxios-error.util';
import { parseGoogleCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/parse-google-calendar-error.util';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class GoogleCalendarGetEventsService {
  private readonly logger = new Logger(GoogleCalendarGetEventsService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const googleCalendarClient = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    let nextSyncToken: string | null | undefined;
    let nextPageToken: string | undefined;
    const events: calendarV3.Schema$Event[] = [];

    let hasMoreEvents = true;

    while (hasMoreEvents) {
      const googleCalendarEvents = await googleCalendarClient.events
        .list({
          calendarId: 'primary',
          maxResults: 500,
          syncToken: syncCursor,
          pageToken: nextPageToken,
          showDeleted: true,
        })
        .catch(async (error: GaxiosError) => {
          this.handleError(error);

          return {
            data: {
              items: [],
              nextSyncToken: undefined,
              nextPageToken: undefined,
            },
          };
        });

      nextSyncToken = googleCalendarEvents.data.nextSyncToken;
      nextPageToken = googleCalendarEvents.data.nextPageToken || undefined;

      const { items } = googleCalendarEvents.data;

      if (!items || items.length === 0) {
        break;
      }

      events.push(...items);

      if (!nextPageToken) {
        hasMoreEvents = false;
      }
    }

    return {
      fullEvents: true,
      calendarEvents: formatGoogleCalendarEvents(events),
      nextSyncCursor: nextSyncToken || '',
    };
  }

  private handleError(error: GaxiosError) {
    this.logger.error(
      `Error in ${GoogleCalendarGetEventsService.name} - getCalendarEvents`,
      error.code,
      error,
    );
    if (
      error.code &&
      [
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNABORTED',
        'ETIMEDOUT',
        'ERR_NETWORK',
      ].includes(error.code)
    ) {
      throw parseGaxiosError(error);
    }
    if (error.response?.status !== 410) {
      this.logger.error(
        `Calendar event import error for Google Calendar. status: ${error.response?.status}`,
      );
      this.logger.log(error);
      const googleCalendarError = {
        code: error.response?.status,
        reason:
          error.response?.data?.error?.errors?.[0].reason ||
          error.response?.data?.error ||
          '',
        message:
          error.response?.data?.error?.errors?.[0].message ||
          error.response?.data?.error_description ||
          '',
      };

      throw parseGoogleCalendarError(googleCalendarError);
    }
  }
}
