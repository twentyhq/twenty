import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
} from 'twenty-shared/types';

import { CALENDAR_EVENT_WEBHOOK_SYNC_INLINE_IMPORT_MAX_EVENTS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-inline-import-max-events.constant';

import { microsoftCalendarEvent } from 'test/integration/microsoft/mocks/microsoft-calendar-event.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findCalendarEventAssociationChannelIds } from 'test/integration/utils/find-calendar-event-association-channel-ids.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { queryCalendarChannel } from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelWebhookSync } from 'test/integration/utils/run-calendar-channel-webhook-sync.util';

const HANDLE = 'microsoft-calendar-webhook-sync@apple.dev';

const deltaToken = () => `webhook-sync-delta-token-${randomUUID()}`;

describe('Microsoft calendar webhook sync (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

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

  it('imports a new event in a single job without a separate import run', async () => {
    const eventTitle = `Webhook event ${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ subject: eventTitle })],
      { deltaToken: deltaToken() },
    );

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
    const eventExternalId = `microsoft-calendar-event-${randomUUID()}`;
    const originalTitle = `Webhook event ${randomUUID()}`;
    const updatedTitle = `Webhook event updated ${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ id: eventExternalId, subject: originalTitle })],
      { deltaToken: deltaToken() },
    );

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([originalTitle])).toEqual([
      originalTitle,
    ]);

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ id: eventExternalId, subject: updatedTitle })],
      { deltaToken: deltaToken() },
    );

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([updatedTitle])).toEqual([
      updatedTitle,
    ]);
    expect(await findImportedCalendarEventTitles([originalTitle])).toEqual([]);
  }, 60000);

  it('deletes the calendar event once the delta reports it removed', async () => {
    const eventExternalId = `microsoft-calendar-event-${randomUUID()}`;
    const eventTitle = `Webhook removable event ${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ id: eventExternalId, subject: eventTitle })],
      { deltaToken: deltaToken() },
    );

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(
      await findCalendarEventAssociationChannelIds(eventExternalId),
    ).toEqual([channel.calendarChannelId]);

    microsoft.serveCalendarEvents([], {
      deltaToken: deltaToken(),
      removedEventIds: [eventExternalId],
    });

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(
      await findCalendarEventAssociationChannelIds(eventExternalId),
    ).toEqual([]);
    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([]);
  }, 60000);

  it('keeps the events that the delta did not report removed', async () => {
    const removedExternalId = `microsoft-calendar-event-${randomUUID()}`;
    const removedTitle = `Webhook removed ${randomUUID()}`;
    const survivingTitle = `Webhook surviving ${randomUUID()}`;

    microsoft.serveCalendarEvents(
      [
        microsoftCalendarEvent({
          id: removedExternalId,
          subject: removedTitle,
        }),
        microsoftCalendarEvent({ subject: survivingTitle }),
      ],
      { deltaToken: deltaToken() },
    );

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(
      await findImportedCalendarEventTitles([removedTitle, survivingTitle]),
    ).toEqual([removedTitle, survivingTitle].sort());

    microsoft.serveCalendarEvents([], {
      deltaToken: deltaToken(),
      removedEventIds: [removedExternalId],
    });

    await runCalendarChannelWebhookSync(channel.calendarChannelId);

    expect(await findImportedCalendarEventTitles([removedTitle])).toEqual([]);
    expect(await findImportedCalendarEventTitles([survivingTitle])).toEqual([
      survivingTitle,
    ]);
  }, 60000);

  it('leaves a delta larger than the inline cap to the import cron', async () => {
    const eventTitles = Array.from(
      { length: CALENDAR_EVENT_WEBHOOK_SYNC_INLINE_IMPORT_MAX_EVENTS + 1 },
      () => `Webhook bulk event ${randomUUID()}`,
    );

    microsoft.serveCalendarEvents(
      eventTitles.map((subject) => microsoftCalendarEvent({ subject })),
      { deltaToken: deltaToken() },
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

    microsoft.serveCalendarEvents(
      [microsoftCalendarEvent({ subject: eventTitle })],
      { deltaToken: deltaToken() },
    );

    await runCalendarChannelWebhookSync(
      channel.calendarChannelId,
      CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
    );

    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([]);
  }, 60000);
});
