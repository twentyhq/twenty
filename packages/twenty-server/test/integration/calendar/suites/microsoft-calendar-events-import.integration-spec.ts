import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  microsoftCalendarEvent,
  microsoftCalendarEventsHandlers,
} from 'test/integration/messaging/utils/microsoft-calendar-mock.util';
import { setupMicrosoftMock } from 'test/integration/messaging/utils/microsoft-message-mock.util';
import { queryCalendarChannel } from 'test/integration/messaging/utils/query-messaging.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import {
  runCalendarChannelEventsImport,
  runCalendarChannelListFetch,
} from 'test/integration/utils/run-sync.util';

const HANDLE = 'microsoft-calendar-events-import@apple.dev';

describe('Microsoft calendar events import (integration)', () => {
  const microsoft = setupMicrosoftMock({ inbox: [], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports calendar events through the real delta-fetch and import pipeline', async () => {
    const eventTitle = `Calendar event ${randomUUID()}`;

    microsoft.use(
      ...microsoftCalendarEventsHandlers([
        microsoftCalendarEvent({ subject: eventTitle }),
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

  it('imports a newly created event through the delta-token continuation', async () => {
    const newEventTitle = `Calendar event ${randomUUID()}`;

    microsoft.use(
      ...microsoftCalendarEventsHandlers(
        [microsoftCalendarEvent({ subject: newEventTitle })],
        { deltaToken: 'mock-calendar-delta-token-2' },
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
