import { randomUUID } from 'node:crypto';

import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

import {
  CALDAV_HOST,
  setupCalDavMock,
} from 'test/integration/caldav/mocks/setup-caldav-mock.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { resetCalendarChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';

const HANDLE = `caldav-events-import-${randomUUID()}@acme-test.com`;

describe('CalDAV calendar events import (integration)', () => {
  const caldav = setupCalDavMock();

  const calendarChannelRepository = getCoreRepository<CalendarChannelEntity>(
    CalendarChannelEntity,
  );

  let connectedAccountId: string;
  let calendarChannelId: string;

  const readChannel = () =>
    calendarChannelRepository.findOneByOrFail({ id: calendarChannelId });

  beforeAll(async () => {
    // The CalDAV driver wraps its fetch in the SSRF guard, which resolves the
    // host for real and would reject the mocked one before msw ever sees it.
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    const { data } = await saveImapSmtpCaldavAccount({
      input: {
        handle: HANDLE,
        connectionParameters: {
          CALDAV: {
            host: CALDAV_HOST,
            port: 443,
            username: HANDLE,
            password: 'caldav-password',
          },
        },
      },
      expectToFail: false,
    });

    connectedAccountId = data.connectedAccountId;

    const channel = await calendarChannelRepository.findOneByOrFail({
      connectedAccountId,
    });

    calendarChannelId = channel.id;
  }, 120000);

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: true },
    }).catch(() => undefined);

    if (connectedAccountId) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }
  });

  it('imports events discovered through the CalDAV collection sync', async () => {
    const eventTitle = `CalDAV event ${randomUUID()}`;

    caldav.serveEvents([
      {
        uid: `caldav-event-${randomUUID()}`,
        summary: eventTitle,
        attendee: `attendee-${randomUUID()}@acme-test.com`,
      },
    ]);

    await resetCalendarChannelSyncState(calendarChannelId, '');

    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);

    expect(await findImportedCalendarEventTitles([eventTitle])).toEqual([
      eventTitle,
    ]);
  }, 120000);

  it('fails the channel when the CalDAV server rejects the credentials', async () => {
    caldav.failWith(401, 'Invalid credentials');

    await resetCalendarChannelSyncState(calendarChannelId, '');

    await runCalendarChannelListFetch(calendarChannelId);

    const channelState = await readChannel();

    expect(channelState.syncStage).toBe(CalendarChannelSyncStage.FAILED);
    expect(channelState.syncStatus).not.toBe(CalendarChannelSyncStatus.ACTIVE);
  }, 120000);
});
