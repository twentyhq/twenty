import { randomUUID } from 'node:crypto';

import {
  CalendarChannelContactAutoCreationPolicy,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findCreatedPeopleEmails } from 'test/integration/utils/find-created-people.util';
import {
  queryCalendarChannel,
  updateCalendarChannel,
} from 'test/integration/utils/query-messaging.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-contact-creation@apple.dev';

describe('Calendar contact auto-creation (integration)', () => {
  const gmail = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const syncEventWithAttendee = async (attendee: string) => {
    gmail.serveCalendarEvents(
      [
        googleCalendarEvent({
          summary: `Calendar event ${randomUUID()}`,
          attendees: [{ email: attendee }],
        }),
      ],
      { nextSyncToken: `sync-token-${randomUUID()}` },
    );

    await resetCalendarChannelSyncState(channel.calendarChannelId, '');

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);

    return findCreatedPeopleEmails([attendee]);
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('creates a person for an attendee when auto-creation is enabled', async () => {
    await updateCalendarChannel(channel.calendarChannelId, {
      isContactAutoCreationEnabled: true,
    });

    const attendee = `attendee-enabled-${randomUUID()}@acme.com`;

    expect(await syncEventWithAttendee(attendee)).toEqual([attendee]);
  }, 120000);

  it('creates no person for an attendee when auto-creation is disabled', async () => {
    await updateCalendarChannel(channel.calendarChannelId, {
      isContactAutoCreationEnabled: false,
    });

    const attendee = `attendee-disabled-${randomUUID()}@acme.com`;

    expect(await syncEventWithAttendee(attendee)).toEqual([]);
  }, 120000);

  // The server gates calendar contact creation on isContactAutoCreationEnabled
  // alone: contactAutoCreationPolicy is stored and served but no import path
  // reads it. These assert the round trip so the values stay addressable if the
  // policy is ever wired into the import.
  it.each(Object.values(CalendarChannelContactAutoCreationPolicy))(
    'persists the %s contact auto-creation policy',
    async (contactAutoCreationPolicy) => {
      await updateCalendarChannel(channel.calendarChannelId, {
        contactAutoCreationPolicy,
      });

      const channelState = await queryCalendarChannel(channel);

      expect(channelState.contactAutoCreationPolicy).toBe(
        contactAutoCreationPolicy,
      );
    },
    60000,
  );
});
