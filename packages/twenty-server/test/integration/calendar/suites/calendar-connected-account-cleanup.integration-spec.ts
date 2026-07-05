import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  googleCalendarEvent,
  googleCalendarEventsHandlers,
} from 'test/integration/messaging/utils/google-calendar-mock.util';
import { deleteConnectedAccount } from 'test/integration/messaging/utils/query-messaging.util';
import {
  findRecordIdsByFilter,
  findRecordNodesByFilter,
} from 'test/integration/utils/find-records-by-filter.util';
import {
  runCalendarChannelEventsImport,
  runCalendarChannelListFetch,
} from 'test/integration/utils/run-sync.util';

const HANDLE = 'calendar-cleanup@apple.dev';

describe('Calendar connected account cleanup (integration)', () => {
  const eventId = `google-calendar-event-${randomUUID()}`;

  const gmail = setupGmailMock({ inbox: [], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    gmail.use(
      ...googleCalendarEventsHandlers([
        googleCalendarEvent({
          id: eventId,
          attendees: [
            { email: `organizer-${eventId}@example.com`, organizer: true },
            { email: `attendee-${eventId}@example.com` },
          ],
        }),
      ]),
    );

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
