import { Injectable, Logger } from '@nestjs/common';

import { google, type calendar_v3 as calendarV3 } from 'googleapis';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import {
  ONBOARDING_INVITE_SUGGESTIONS_LOOKAHEAD_DAYS,
  ONBOARDING_INVITE_SUGGESTIONS_LOOKBACK_DAYS,
  ONBOARDING_INVITE_SUGGESTIONS_MAX_EVENTS,
} from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions.constants';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type RawCalendarAttendee = {
  email: string;
  displayName?: string;
};

@Injectable()
export class GoogleCalendarAttendeesService {
  private readonly logger = new Logger(GoogleCalendarAttendeesService.name);

  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  // Fetches a single bounded page of recent primary-calendar events and
  // returns every attendee/organizer handle we can see. Filtering down to
  // actual teammates happens upstream.
  async getRecentAttendees(
    connectedAccountId: string,
  ): Promise<RawCalendarAttendee[]> {
    const oAuth2Client =
      await this.googleOAuth2ClientProvider.getClient(connectedAccountId);

    const googleCalendarClient = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    const now = Date.now();

    let events: calendarV3.Schema$Event[] = [];

    try {
      const response = await googleCalendarClient.events.list({
        calendarId: 'primary',
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: ONBOARDING_INVITE_SUGGESTIONS_MAX_EVENTS,
        timeMin: new Date(
          now - ONBOARDING_INVITE_SUGGESTIONS_LOOKBACK_DAYS * MS_PER_DAY,
        ).toISOString(),
        timeMax: new Date(
          now + ONBOARDING_INVITE_SUGGESTIONS_LOOKAHEAD_DAYS * MS_PER_DAY,
        ).toISOString(),
      });

      events = response.data.items ?? [];
    } catch (error) {
      // A failed suggestion fetch must never break onboarding: degrade to no
      // suggestions instead.
      this.logger.warn(
        `Failed to fetch calendar events for invite suggestions: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );

      return [];
    }

    const attendees: RawCalendarAttendee[] = [];

    for (const event of events) {
      if (event.organizer?.email) {
        attendees.push({
          email: event.organizer.email,
          displayName: event.organizer.displayName ?? undefined,
        });
      }

      for (const attendee of event.attendees ?? []) {
        // Skip rooms and other non-human resources.
        if (!attendee.email || attendee.resource === true) {
          continue;
        }

        attendees.push({
          email: attendee.email,
          displayName: attendee.displayName ?? undefined,
        });
      }
    }

    return attendees;
  }
}
