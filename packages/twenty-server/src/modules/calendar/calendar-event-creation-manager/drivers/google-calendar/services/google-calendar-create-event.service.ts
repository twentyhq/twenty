import { Injectable } from '@nestjs/common';

import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type calendar_v3 as calendarV3, google } from 'googleapis';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { formatGoogleCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/format-google-calendar-event.util';
import { toGoogleEventInput } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/to-google-event-input.util';
import {
  CalendarEventCreationException,
  CalendarEventCreationExceptionCode,
} from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventCreationDriver } from 'src/modules/calendar/calendar-event-creation-manager/interfaces/calendar-event-creation-driver.interface';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';

const GOOGLE_CALENDAR_ID = 'primary';

@Injectable()
export class GoogleCalendarCreateEventService implements CalendarEventCreationDriver {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createCalendarEvent(
    input: CalendarEventToCreate,
    connectedAccount: Pick<ConnectedAccountEntity, 'id' | 'provider'>,
  ): Promise<FetchedCalendarEvent> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const googleCalendarClient = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    try {
      const { data } = await googleCalendarClient.events.insert({
        calendarId: GOOGLE_CALENDAR_ID,
        conferenceDataVersion: input.addConferencing ? 1 : 0,
        sendUpdates: input.sendInvitations ? 'all' : 'none',
        requestBody: toGoogleEventInput(input),
      });

      const firstOccurrence = await this.findFirstOccurrenceAsListedBySync({
        googleCalendarClient,
        createdEvent: data,
      });

      return formatGoogleCalendarEvents([firstOccurrence ?? data])[0];
    } catch (error) {
      throw new CalendarEventCreationException(
        `Failed to create Google calendar event: ${error instanceof Error ? error.message : 'unknown error'}`,
        CalendarEventCreationExceptionCode.PROVIDER_REQUEST_FAILED,
      );
    }
  }

  private async findFirstOccurrenceAsListedBySync({
    googleCalendarClient,
    createdEvent,
  }: {
    googleCalendarClient: calendarV3.Calendar;
    createdEvent: calendarV3.Schema$Event;
  }): Promise<calendarV3.Schema$Event | undefined> {
    if (
      !isNonEmptyArray(createdEvent.recurrence) ||
      !isNonEmptyString(createdEvent.id)
    ) {
      return undefined;
    }

    return googleCalendarClient.events
      .instances({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: createdEvent.id,
        maxResults: 1,
      })
      .then(({ data }) => data.items?.[0])
      .catch((error: unknown) => {
        this.exceptionHandlerService.captureExceptions([error]);

        return undefined;
      });
  }
}
