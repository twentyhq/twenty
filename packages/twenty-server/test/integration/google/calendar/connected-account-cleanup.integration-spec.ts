import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import {
  findRecordIdsByFilter,
  findRecordNodesByFilter,
} from 'test/integration/utils/find-records-by-filter.util';
import { deleteConnectedAccount } from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'calendar-cleanup@apple.dev';

describe('Calendar connected account cleanup (integration)', () => {
  const eventId = `google-calendar-event-${randomUUID()}`;

  const gmail = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    gmail.serveCalendarEvents([
      googleCalendarEvent({
        id: eventId,
        attendees: [
          { email: `organizer-${eventId}@example.com`, organizer: true },
          { email: `attendee-${eventId}@example.com` },
        ],
      }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('deletes all associated calendar data when the connected account is removed', async () => {
    const associations = await findRecordNodesByFilter<{
      id: string;
      calendarEventId: string;
    }>(
      'calendarChannelEventAssociation',
      'calendarChannelEventAssociations',
      `id
        calendarEventId`,
      { calendarChannelId: { eq: channel.calendarChannelId } },
    );

    expect(associations).toHaveLength(1);

    const eventIds = associations.map(
      (association) => association.calendarEventId,
    );

    expect(
      await findRecordIdsByFilter('calendarEvent', 'calendarEvents', {
        id: { in: eventIds },
      }),
    ).not.toHaveLength(0);
    expect(
      await findRecordIdsByFilter(
        'calendarEventParticipant',
        'calendarEventParticipants',
        { calendarEventId: { in: eventIds } },
      ),
    ).not.toHaveLength(0);

    await deleteConnectedAccount(channel.connectedAccountId);

    expect(
      await findRecordIdsByFilter(
        'calendarChannelEventAssociation',
        'calendarChannelEventAssociations',
        { calendarChannelId: { eq: channel.calendarChannelId } },
      ),
    ).toHaveLength(0);
    expect(
      await findRecordIdsByFilter('calendarEvent', 'calendarEvents', {
        id: { in: eventIds },
      }),
    ).toHaveLength(0);
    expect(
      await findRecordIdsByFilter(
        'calendarEventParticipant',
        'calendarEventParticipants',
        { calendarEventId: { in: eventIds } },
      ),
    ).toHaveLength(0);
  }, 60000);
});
