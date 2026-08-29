import { Injectable } from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';

import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher';
import { type GaxiosError } from 'gaxios';
import { type calendar_v3 as calendarV3, google } from 'googleapis';
import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { GOOGLE_CALENDAR_BATCH_MIN_INTERVAL_MS } from 'src/modules/calendar/calendar-event-import-manager/constants/google-calendar-batch-min-interval-ms';
import { GOOGLE_CALENDAR_BATCH_REQUEST_MAX_SIZE } from 'src/modules/calendar/calendar-event-import-manager/constants/google-calendar-batch-request-max-size';
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
    const googleCalendarClient = await this.getBatchedClient(
      connectedAccount.id,
    );

    const fetchedEvents: (calendarV3.Schema$Event | null)[] = [];
    const eventExternalIdsBatches = chunk(
      eventExternalIds,
      GOOGLE_CALENDAR_BATCH_REQUEST_MAX_SIZE,
    );

    for (const [
      batchIndex,
      eventExternalIdsBatch,
    ] of eventExternalIdsBatches.entries()) {
      if (batchIndex > 0) {
        await sleep(GOOGLE_CALENDAR_BATCH_MIN_INTERVAL_MS);
      }

      fetchedEvents.push(
        ...(await Promise.all(
          eventExternalIdsBatch.map((eventExternalId) =>
            this.getCalendarEvent(googleCalendarClient, eventExternalId),
          ),
        )),
      );
    }

    return formatGoogleCalendarEvents(fetchedEvents.filter(isDefined));
  }

  private async getBatchedClient(
    connectedAccountId: string,
  ): Promise<calendarV3.Calendar> {
    const oAuth2Client =
      await this.googleOAuth2ClientProvider.getClient(connectedAccountId);

    return google.calendar({
      version: 'v3',
      auth: oAuth2Client,
      fetchImplementation: batchFetchImplementation({
        maxBatchSize: GOOGLE_CALENDAR_BATCH_REQUEST_MAX_SIZE,
      }),
    });
  }

  private getCalendarEvent(
    googleCalendarClient: calendarV3.Calendar,
    eventExternalId: string,
  ): Promise<calendarV3.Schema$Event | null> {
    return googleCalendarClient.events
      .get({ calendarId: 'primary', eventId: eventExternalId })
      .then((response) => response.data)
      .catch((error: GaxiosError) => {
        const status = error.response?.status;

        if (status === 404 || status === 410) {
          return null;
        }

        if (!isDefined(status)) {
          throw parseGaxiosError(error);
        }

        throw parseGoogleCalendarError({
          code: status,
          reason: error.response?.data?.error?.errors?.[0].reason || '',
          message: error.response?.data?.error?.errors?.[0].message || '',
        });
      });
  }
}
