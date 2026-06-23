import { Injectable } from '@nestjs/common';

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
          .catch((error: GaxiosError) => {
            const status = error.response?.status;

            if (!isDefined(status)) {
              throw parseGaxiosError(error);
            }

            throw parseGoogleCalendarError({
              code: status,
              reason: error.response?.data?.error?.errors?.[0].reason || '',
              message: error.response?.data?.error?.errors?.[0].message || '',
            });
          }),
      ),
    );

    return formatGoogleCalendarEvents(fetchedEvents.filter(isDefined));
  }
}
