import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = 'google-calendar-internal-events@apple.dev';

describe('Google calendar internal events (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const syncEvents = async (
    events: ReturnType<typeof googleCalendarEvent>[],
  ) => {
    google.serveCalendarEvents(events, {
      nextSyncToken: `sync-token-${randomUUID()}`,
    });

    await resetCalendarChannelSyncState(channel.calendarChannelId, '');

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await updateWorkspace({
      data: { isInternalMessagesImportEnabled: false },
    });
    await channel?.cleanup().catch(() => undefined);
  });

  it('skips internal and solo events and imports events with an external attendee or organizer', async () => {
    const internalTitle = `Internal event ${randomUUID()}`;
    const soloTitle = `Solo event ${randomUUID()}`;
    const externalTitle = `External event ${randomUUID()}`;
    const externallyOrganizedTitle = `Externally organized ${randomUUID()}`;

    await syncEvents([
      googleCalendarEvent({
        summary: internalTitle,
        attendees: [
          { email: HANDLE },
          { email: `colleague-${randomUUID()}@apple.dev` },
        ],
      }),
      googleCalendarEvent({ summary: soloTitle, attendees: [] }),
      googleCalendarEvent({
        summary: externalTitle,
        attendees: [
          { email: HANDLE },
          { email: `customer-${randomUUID()}@acme.com` },
        ],
      }),
      googleCalendarEvent({
        summary: externallyOrganizedTitle,
        organizer: { email: `customer-${randomUUID()}@acme.com` },
        attendees: [{ email: HANDLE }],
      }),
    ]);

    expect(
      await findImportedCalendarEventTitles([
        internalTitle,
        soloTitle,
        externalTitle,
        externallyOrganizedTitle,
      ]),
    ).toEqual([externalTitle, externallyOrganizedTitle]);
  }, 120000);

  it('imports internal events when internal import is enabled on the workspace', async () => {
    await updateWorkspace({
      data: { isInternalMessagesImportEnabled: true },
    });

    const internalTitle = `Internal event ${randomUUID()}`;

    await syncEvents([
      googleCalendarEvent({
        summary: internalTitle,
        attendees: [
          { email: HANDLE },
          { email: `colleague-${randomUUID()}@apple.dev` },
        ],
      }),
    ]);

    expect(await findImportedCalendarEventTitles([internalTitle])).toEqual([
      internalTitle,
    ]);
  }, 120000);
});
