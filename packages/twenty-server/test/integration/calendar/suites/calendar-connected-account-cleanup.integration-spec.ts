import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  findRecordIdsByFilter,
  findRecordNodesByFilter,
} from 'test/integration/messaging/utils/find-records-by-filter.util';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  googleCalendarEvent,
  googleCalendarEventsHandler,
} from 'test/integration/messaging/utils/google-calendar-mock.util';
import { deleteConnectedAccount } from 'test/integration/messaging/utils/query-messaging.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-channel-sync.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const HANDLE = 'calendar-cleanup@apple.dev';

describe('Calendar connected account cleanup (integration)', () => {
  const eventId = `google-calendar-event-${randomUUID()}`;
  const eventTitle = `Calendar event ${randomUUID()}`;

  const gmail = setupGmailMock({ inbox: [], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    gmail.use(
      googleCalendarEventsHandler([
        googleCalendarEvent({
          id: eventId,
          summary: eventTitle,
          attendees: [
            { email: 'organizer@example.com', organizer: true },
            { email: 'attendee@example.com' },
          ],
        }),
      ]),
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);

    await pollUntil(
      () =>
        findRecordIdsByFilter(
          'calendarChannelEventAssociation',
          'calendarChannelEventAssociations',
          { calendarChannelId: { eq: channel.calendarChannelId } },
        ),
      (ids) => ids.length > 0,
    );
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

    expect(associations).not.toHaveLength(0);

    const eventIds = associations.map((association) => association.calendarEventId);

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

    await pollUntil(
      async () => {
        const [remainingAssociations, remainingEvents, remainingParticipants] =
          await Promise.all([
            findRecordIdsByFilter(
              'calendarChannelEventAssociation',
              'calendarChannelEventAssociations',
              { calendarChannelId: { eq: channel.calendarChannelId } },
            ),
            findRecordIdsByFilter('calendarEvent', 'calendarEvents', {
              id: { in: eventIds },
            }),
            findRecordIdsByFilter(
              'calendarEventParticipant',
              'calendarEventParticipants',
              { calendarEventId: { in: eventIds } },
            ),
          ]);

        return (
          remainingAssociations.length +
          remainingEvents.length +
          remainingParticipants.length
        );
      },
      (remaining) => remaining === 0,
    );
  }, 60000);
});
