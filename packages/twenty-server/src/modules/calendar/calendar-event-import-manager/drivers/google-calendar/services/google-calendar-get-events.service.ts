import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString, isString } from '@sniptt/guards';
import { type GaxiosError } from 'gaxios';
import { type calendar_v3 as calendarV3, google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { type GoogleCalendarRecurringEventInstances } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/types/google-calendar-recurring-event-instances.type';
import { getGoogleCalendarEventStartTime } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/get-google-calendar-event-start-time.util';
import { parseGaxiosError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/parse-gaxios-error.util';
import { parseGoogleCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/parse-google-calendar-error.util';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class GoogleCalendarGetEventsService {
  private readonly logger = new Logger(GoogleCalendarGetEventsService.name);

  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  public async getCalendarEvents({
    connectedAccount,
    syncCursor,
    recurringEventHorizon,
  }: {
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>;
    syncCursor?: string;
    recurringEventHorizon?: Date;
  }): Promise<GetCalendarEventsResponse> {
    const googleCalendarClient =
      await this.getGoogleCalendarClient(connectedAccount);

    let nextSyncToken: string | null | undefined;
    let nextPageToken: string | undefined;
    const calendarEventIds: string[] = [];
    const calendarEventIdsToDelete: string[] = [];
    const recurringEventExternalIdsBeyondHorizon = new Set<string>();

    let hasMoreEvents = true;

    while (hasMoreEvents) {
      const googleCalendarEvents = await googleCalendarClient.events
        .list({
          calendarId: 'primary',
          maxResults: 500,
          singleEvents: true,
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

      for (const item of items) {
        if (!isString(item.id)) {
          continue;
        }

        const itemStartTime = getGoogleCalendarEventStartTime(item);

        if (item.status === 'cancelled') {
          calendarEventIdsToDelete.push(item.id);
        } else if (
          isDefined(recurringEventHorizon) &&
          isNonEmptyString(item.recurringEventId) &&
          isDefined(itemStartTime) &&
          itemStartTime >= recurringEventHorizon.getTime()
        ) {
          calendarEventIdsToDelete.push(item.id);
          recurringEventExternalIdsBeyondHorizon.add(item.recurringEventId);
        } else {
          calendarEventIds.push(item.id);
        }
      }

      if (!nextPageToken) {
        hasMoreEvents = false;
      }
    }

    return {
      calendarEventIds,
      calendarEventIdsToDelete,
      recurringEventExternalIdsBeyondHorizon: [
        ...recurringEventExternalIdsBeyondHorizon,
      ],
      nextSyncCursor: nextSyncToken || '',
    };
  }

  public async getUpcomingRecurringEventInstances({
    connectedAccount,
    recurringEventExternalId,
    recurringEventHorizon,
  }: {
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>;
    recurringEventExternalId: string;
    recurringEventHorizon: Date;
  }): Promise<GoogleCalendarRecurringEventInstances> {
    const googleCalendarClient =
      await this.getGoogleCalendarClient(connectedAccount);

    const instanceExternalIdsWithinHorizon: string[] = [];
    let earliestInstanceStartTimeBeyondHorizon: number | null = null;
    let nextPageToken: string | undefined;

    do {
      const { data: recurringEventInstancesPage } =
        await googleCalendarClient.events
          .instances({
            calendarId: 'primary',
            eventId: recurringEventExternalId,
            timeMin: new Date().toISOString(),
            fields: 'items(id,start),nextPageToken',
            maxResults: 2500,
            pageToken: nextPageToken,
          })
          .catch((error: GaxiosError) => {
            if (error.response?.status !== 404) {
              this.handleError(error);
            }

            return { data: { items: [], nextPageToken: undefined } };
          });

      for (const instance of recurringEventInstancesPage.items ?? []) {
        const instanceStartTime = getGoogleCalendarEventStartTime(instance);

        if (!isString(instance.id) || !isDefined(instanceStartTime)) {
          continue;
        }

        if (instanceStartTime < recurringEventHorizon.getTime()) {
          instanceExternalIdsWithinHorizon.push(instance.id);
        } else {
          earliestInstanceStartTimeBeyondHorizon = Math.min(
            earliestInstanceStartTimeBeyondHorizon ?? instanceStartTime,
            instanceStartTime,
          );
        }
      }

      nextPageToken = recurringEventInstancesPage.nextPageToken ?? undefined;
    } while (isDefined(nextPageToken));

    return {
      instanceExternalIdsWithinHorizon,
      earliestInstanceStartTimeBeyondHorizon,
    };
  }

  private async getGoogleCalendarClient(
    connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'id'>,
  ): Promise<calendarV3.Calendar> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    return google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });
  }

  private handleError(error: GaxiosError) {
    this.logger.error(
      `Error in ${GoogleCalendarGetEventsService.name} - getCalendarEvents`,
      error.code,
      error,
    );
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
    if (error.response?.status !== 410) {
      this.logger.error(
        `Calendar event import error for Google Calendar. status: ${error.response?.status}`,
      );
      this.logger.error(error);
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

      throw parseGoogleCalendarError(googleCalendarError, { cause: error });
    }
  }
}
