import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { queryCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-events-import@apple.dev';

describe('Google calendar events import (integration)', () => {
  const gmail = setupGoogleMock({ handle: HANDLE });

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

    gmail.serveCalendarEvents([googleCalendarEvent({ summary: eventTitle })]);

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

    gmail.serveCalendarEvents(
      [googleCalendarEvent({ summary: newEventTitle })],
      { nextSyncToken: 'mock-calendar-sync-token-2' },
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
