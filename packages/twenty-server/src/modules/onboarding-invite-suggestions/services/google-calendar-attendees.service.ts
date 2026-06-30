import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { ONBOARDING_INVITE_SUGGESTIONS_LOOKAHEAD_DAYS } from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions-lookahead-days.constant';
import { ONBOARDING_INVITE_SUGGESTIONS_LOOKBACK_DAYS } from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions-lookback-days.constant';
import { ONBOARDING_INVITE_SUGGESTIONS_MAX_EVENTS } from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions-max-events.constant';
import { type CalendarAttendee } from 'src/modules/onboarding-invite-suggestions/types/calendar-attendee.type';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class GoogleCalendarAttendeesService {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  async getRecentAttendees(
    connectedAccountId: string,
  ): Promise<CalendarAttendee[]> {
    const oAuth2Client =
      await this.googleOAuth2ClientProvider.getClient(connectedAccountId);

    const googleCalendarClient = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    const now = Date.now();

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

    const events = response.data.items ?? [];
    const attendees: CalendarAttendee[] = [];

    for (const event of events) {
      const displayNameByEmail = new Map<string, string | undefined>();

      const organizerEmail = event.organizer?.email?.toLowerCase();

      if (organizerEmail) {
        displayNameByEmail.set(
          organizerEmail,
          event.organizer?.displayName ?? undefined,
        );
      }

      for (const attendee of event.attendees ?? []) {
        const attendeeEmail = attendee.email?.toLowerCase();
        const isRoomOrResource = attendee.resource === true;

        if (
          !attendeeEmail ||
          isRoomOrResource ||
          displayNameByEmail.has(attendeeEmail)
        ) {
          continue;
        }

        displayNameByEmail.set(
          attendeeEmail,
          attendee.displayName ?? undefined,
        );
      }

      for (const [email, displayName] of displayNameByEmail) {
        attendees.push({ email, displayName });
      }
    }

    return attendees;
  }
}
