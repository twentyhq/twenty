import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { google } from 'googleapis';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { formatGoogleCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/format-google-calendar-event.util';
import { toGoogleEventInput } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/to-google-event-input.util';
import {
  CalendarEventCreationException,
  CalendarEventCreationExceptionCode,
} from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventCreationDriver } from 'src/modules/calendar/calendar-event-creation-manager/interfaces/calendar-event-creation-driver.interface';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';

const GOOGLE_CALENDAR_ID = 'primary';

@Injectable()
export class GoogleCalendarCreateEventService implements CalendarEventCreationDriver {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
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

      const createdEvent = formatGoogleCalendarEvents([data])[0];

      if (
        input.addConferencing &&
        !isNonEmptyString(createdEvent.conferenceLinkUrl) &&
        isNonEmptyString(data.id)
      ) {
        return this.resolvePendingConferenceLink(
          googleCalendarClient,
          data.id,
          createdEvent,
        );
      }

      return createdEvent;
    } catch (error) {
      throw new CalendarEventCreationException(
        `Failed to create Google calendar event: ${error instanceof Error ? error.message : 'unknown error'}`,
        CalendarEventCreationExceptionCode.PROVIDER_REQUEST_FAILED,
      );
    }
  }

  // Google provisions the Meet conference asynchronously, so the insert response
  // may not yet carry the link; re-fetch once to resolve it (the sync reconciles
  // it later if it is still pending).
  private async resolvePendingConferenceLink(
    googleCalendarClient: ReturnType<typeof google.calendar>,
    eventId: string,
    createdEvent: FetchedCalendarEvent,
  ): Promise<FetchedCalendarEvent> {
    try {
      const { data } = await googleCalendarClient.events.get({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId,
      });

      const refetchedEvent = formatGoogleCalendarEvents([data])[0];

      return isNonEmptyString(refetchedEvent.conferenceLinkUrl)
        ? refetchedEvent
        : createdEvent;
    } catch {
      return createdEvent;
    }
  }
}
