import { Injectable } from '@nestjs/common';

import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import {
  ONBOARDING_INVITE_SUGGESTIONS_LOOKAHEAD_DAYS,
  ONBOARDING_INVITE_SUGGESTIONS_LOOKBACK_DAYS,
  ONBOARDING_INVITE_SUGGESTIONS_MAX_EVENTS,
} from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions.constants';
import { type RawCalendarAttendee } from 'src/modules/onboarding-invite-suggestions/types/raw-calendar-attendee.type';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type MicrosoftEmailAddress = {
  address?: string | null;
  name?: string | null;
};

type MicrosoftCalendarViewResponse = {
  value?: {
    organizer?: { emailAddress?: MicrosoftEmailAddress | null } | null;
    attendees?:
      | {
          type?: string | null;
          emailAddress?: MicrosoftEmailAddress | null;
        }[]
      | null;
  }[];
};

@Injectable()
export class MicrosoftCalendarAttendeesService {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
  ) {}

  async getRecentAttendees(
    connectedAccountId: string,
  ): Promise<RawCalendarAttendee[]> {
    const microsoftClient =
      await this.microsoftOAuth2ClientProvider.getClient(connectedAccountId);

    const now = Date.now();

    const response: MicrosoftCalendarViewResponse = await microsoftClient
      .api('/me/calendarView')
      .query({
        startDateTime: new Date(
          now - ONBOARDING_INVITE_SUGGESTIONS_LOOKBACK_DAYS * MS_PER_DAY,
        ).toISOString(),
        endDateTime: new Date(
          now + ONBOARDING_INVITE_SUGGESTIONS_LOOKAHEAD_DAYS * MS_PER_DAY,
        ).toISOString(),
      })
      .select('organizer,attendees')
      .top(ONBOARDING_INVITE_SUGGESTIONS_MAX_EVENTS)
      .get();

    const events = response.value ?? [];
    const attendees: RawCalendarAttendee[] = [];

    for (const event of events) {
      const displayNameByEmail = new Map<string, string | undefined>();

      const organizerEmail =
        event.organizer?.emailAddress?.address?.toLowerCase();

      if (organizerEmail) {
        displayNameByEmail.set(
          organizerEmail,
          event.organizer?.emailAddress?.name ?? undefined,
        );
      }

      for (const attendee of event.attendees ?? []) {
        const attendeeEmail = attendee.emailAddress?.address?.toLowerCase();
        const isRoomOrResource = attendee.type === 'resource';

        if (
          !attendeeEmail ||
          isRoomOrResource ||
          displayNameByEmail.has(attendeeEmail)
        ) {
          continue;
        }

        displayNameByEmail.set(
          attendeeEmail,
          attendee.emailAddress?.name ?? undefined,
        );
      }

      for (const [email, displayName] of displayNameByEmail) {
        attendees.push({ email, displayName });
      }
    }

    return attendees;
  }
}
