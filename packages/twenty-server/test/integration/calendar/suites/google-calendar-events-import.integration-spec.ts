import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  googleCalendarEvent,
  googleCalendarEventsHandler,
} from 'test/integration/messaging/utils/google-calendar-mock.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-channel-sync.util';

const HANDLE = 'google-calendar-events-import@apple.dev';

const findImportedEventTitles = async (titles: string[]): Promise<string[]> => {
  const events = await findRecordNodesByFilter<{ title: string }>(
    'calendarEvent',
    'calendarEvents',
    'title',
    { title: { in: titles } },
  );

  return events.map((event) => event.title);
};

describe('Google calendar events import (integration)', () => {
  const gmail = setupGmailMock({ inbox: [], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports calendar events through the real list-fetch pipeline', async () => {
    const eventTitle = `Calendar event ${randomUUID()}`;

    gmail.use(
      googleCalendarEventsHandler([
        googleCalendarEvent({ summary: eventTitle }),
      ]),
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);

    expect(await findImportedEventTitles([eventTitle])).toEqual([eventTitle]);
  }, 60000);

  it('imports a newly created event through the sync-token incremental fetch', async () => {
    const newEventTitle = `Calendar event ${randomUUID()}`;

    gmail.use(
      googleCalendarEventsHandler(
        [googleCalendarEvent({ summary: newEventTitle })],
        { nextSyncToken: 'mock-calendar-sync-token-2' },
      ),
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);

    expect(await findImportedEventTitles([newEventTitle])).toEqual([
      newEventTitle,
    ]);
  }, 60000);
});
