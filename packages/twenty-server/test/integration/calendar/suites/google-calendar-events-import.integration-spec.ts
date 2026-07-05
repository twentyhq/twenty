import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { setupGmailMock } from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  googleCalendarEvent,
  googleCalendarEventsHandlers,
} from 'test/integration/messaging/utils/google-calendar-mock.util';
import { queryCalendarChannel } from 'test/integration/messaging/utils/query-messaging.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import {
  runCalendarChannelEventsImport,
  runCalendarChannelListFetch,
} from 'test/integration/utils/run-sync.util';

const HANDLE = 'google-calendar-events-import@apple.dev';

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

  it('imports calendar events through the real list-fetch and import pipeline', async () => {
    const eventTitle = `Calendar event ${randomUUID()}`;

    gmail.use(
      ...googleCalendarEventsHandlers([
        googleCalendarEvent({ summary: eventTitle }),
      ]),
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );

    await runCalendarChannelEventsImport(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([
      eventTitle,
    ]);
  }, 60000);

  it('imports a newly created event through the sync-token incremental fetch', async () => {
    const newEventTitle = `Calendar event ${randomUUID()}`;

    gmail.use(
      ...googleCalendarEventsHandlers(
        [googleCalendarEvent({ summary: newEventTitle })],
        { nextSyncToken: 'mock-calendar-sync-token-2' },
      ),
    );

    await runCalendarChannelListFetch(channel.calendarChannelId);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );

    await runCalendarChannelEventsImport(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([newEventTitle])).toEqual([
      newEventTitle,
    ]);
  }, 60000);
});
