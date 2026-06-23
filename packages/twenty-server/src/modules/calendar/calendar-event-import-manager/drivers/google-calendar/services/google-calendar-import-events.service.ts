import { Injectable, Logger } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { type GaxiosError } from 'gaxios';
import { google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { formatGoogleCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/format-google-calendar-event.util';
import { parseGaxiosError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/parse-gaxios-error.util';
import { parseGoogleCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/parse-google-calendar-error.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class GoogleCalendarImportEventsService {
  private readonly logger = new Logger(GoogleCalendarImportEventsService.name);

  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>,
    eventExternalIds: string[],
  ): Promise<FetchedCalendarEvent[]> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const googleCalendarClient = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    const fetchedEvents = await Promise.all(
      eventExternalIds.map((eventExternalId) =>
        googleCalendarClient.events
          .get({ calendarId: 'primary', eventId: eventExternalId })
          .then((response) => response.data)
          .catch((error: GaxiosError) =>
            this.handleDeletedOrFailedEvent(error),
          ),
      ),
    );

    return formatGoogleCalendarEvents(fetchedEvents.filter(isDefined));
  }

  private handleDeletedOrFailedEvent(error: GaxiosError): null {
    if (error.response?.status === 404 || error.response?.status === 410) {
      return null;
    }

    if (
      isString(error.code) &&
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

    this.logger.error(
      `Calendar event import error for Google Calendar. status: ${error.response?.status}`,
      error,
    );

    throw parseGoogleCalendarError({
      code: error.response?.status,
      reason: error.response?.data?.error?.errors?.[0].reason || '',
      message: error.response?.data?.error?.errors?.[0].message || '',
    });
  }
}
