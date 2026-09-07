import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { CALENDAR_EVENT_WEBHOOK_SYNC_INLINE_IMPORT_MAX_EVENTS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-inline-import-max-events.constant';

import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { queryCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelWebhookSync } from 'test/integration/utils/run-calendar-channel-webhook-sync.util';

const HANDLE = 'google-calendar-webhook-sync@apple.dev';

describe('Google calendar webhook sync (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

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

  it('imports a new event in a single job without a separate import run', async () => {
    const eventTitle = `Webhook event ${randomUUID()}`;

    google.serveCalendarEvents([googleCalendarEvent({ summary: eventTitle })], {
      nextSyncToken: `webhook-sync-token-${randomUUID()}`,
    });

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([
      eventTitle,
    ]);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    );
  }, 60000);

  it('applies an update to an already imported event', async () => {
    const eventExternalId = `google-calendar-event-${randomUUID()}`;
    const originalTitle = `Webhook event ${randomUUID()}`;
    const updatedTitle = `Webhook event updated ${randomUUID()}`;

    google.serveCalendarEvents(
      [googleCalendarEvent({ id: eventExternalId, summary: originalTitle })],
      { nextSyncToken: `webhook-sync-token-${randomUUID()}` },
    );

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([originalTitle])).toEqual([
      originalTitle,
    ]);

    google.serveCalendarEvents(
      [googleCalendarEvent({ id: eventExternalId, summary: updatedTitle })],
      { nextSyncToken: `webhook-sync-token-${randomUUID()}` },
    );

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([updatedTitle])).toEqual([
      updatedTitle,
    ]);
    expect(await findImportedCalendarEventTitles([originalTitle])).toEqual([]);
  }, 60000);

  it('leaves a delta larger than the inline cap to the import cron', async () => {
    const eventTitles = Array.from(
      { length: CALENDAR_EVENT_WEBHOOK_SYNC_INLINE_IMPORT_MAX_EVENTS + 1 },
      () => `Webhook bulk event ${randomUUID()}`,
    );

    google.serveCalendarEvents(
      eventTitles.map((summary) => googleCalendarEvent({ summary })),
      { nextSyncToken: `webhook-sync-token-${randomUUID()}` },
    );

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles(eventTitles)).toEqual([]);

    const channelState = await queryCalendarChannel(channel);

    expect(channelState.syncStage).toBe(
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    );

    await runCalendarChannelEventsImport(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles(eventTitles)).toEqual(
      [...eventTitles].sort(),
    );
  }, 120000);

  it('does not sync when the channel is already being synced', async () => {
    const eventTitle = `Webhook event ${randomUUID()}`;

    google.serveCalendarEvents([googleCalendarEvent({ summary: eventTitle })], {
      nextSyncToken: `webhook-sync-token-${randomUUID()}`,
    });

    await runCalendarChannelWebhookSync(
      channel.calendarChannelId,
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
    );

    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([]);
  }, 60000);
});
