import { randomUUID } from 'node:crypto';

import { CalendarChannelSyncStatus } from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import {
  type LegacyCalDavProxy,
  startLegacyCalDavProxy,
} from 'test/integration/utils/start-legacy-caldav-proxy.util';
import {
  type RadicaleServer,
  startRadicaleContainer,
} from 'test/integration/utils/start-radicale-container.util';

const HANDLE = `caldav-legacy-sync-${randomUUID()}@acme.test`;
const COLLECTION = 'personal';

const icalEvent = ({ uid, summary }: { uid: string; summary: string }) =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Twenty//CalDAV integration test//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    'DTSTAMP:20231101T000000Z',
    'DTSTART:20231115T100000Z',
    'DTEND:20231115T110000Z',
    `SUMMARY:${summary}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

describe('CalDAV legacy server sync (integration)', () => {
  let radicale: RadicaleServer;
  let proxy: LegacyCalDavProxy;
  let connectedAccountId: string;
  let calendarChannelId: string;

  const collectionUrl = () =>
    `http://${proxy.host}:${proxy.port}/${HANDLE}/${COLLECTION}/`;

  const putEvent = async ({ uid, summary }: { uid: string; summary: string }) =>
    fetch(`${collectionUrl()}${uid}.ics`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
      body: icalEvent({ uid, summary }),
    });

  const readChannel = () =>
    getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).findOneByOrFail({ id: calendarChannelId });

  const syncCalendarChannel = async () => {
    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    radicale = await startRadicaleContainer();
    proxy = await startLegacyCalDavProxy({
      targetHost: radicale.host,
      targetPort: radicale.port,
    });

    await fetch(collectionUrl(), {
      method: 'MKCOL',
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      body: `<?xml version="1.0" encoding="utf-8"?>
        <mkcol xmlns="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
          <set><prop>
            <resourcetype><collection/><c:calendar/></resourcetype>
            <displayname>Personal</displayname>
            <c:supported-calendar-component-set><c:comp name="VEVENT"/></c:supported-calendar-component-set>
          </prop></set>
        </mkcol>`,
    });

    const { data } = await saveImapSmtpCaldavAccount({
      input: {
        handle: HANDLE,
        connectionParameters: {
          CALDAV: {
            host: `${proxy.host}:${proxy.port}`,
            port: proxy.port,
            username: HANDLE,
            password: 'radicale-password',
          },
        },
      },
      expectToFail: false,
    });

    connectedAccountId = data.connectedAccountId;
    calendarChannelId = (
      await getCoreRepository<CalendarChannelEntity>(
        CalendarChannelEntity,
      ).findOneByOrFail({ connectedAccountId })
    ).id;
  }, 300000);

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

    await proxy?.stop().catch(() => undefined);
    await radicale?.stop().catch(() => undefined);
  });

  it('imports events from a server that cannot report changes incrementally', async () => {
    const summary = `Legacy CalDAV event ${randomUUID()}`;

    await putEvent({ uid: `legacy-event-${randomUUID()}`, summary });

    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
  }, 300000);

  it('stores a collection tag rather than a sync token', async () => {
    const { syncCursor } = await readChannel();

    expect(syncCursor).toContain('ctags');
    expect(syncCursor).not.toContain('syncTokens');
  }, 300000);

  it('imports an event added after the stored collection tag', async () => {
    const summary = `Legacy CalDAV event ${randomUUID()}`;

    await putEvent({ uid: `legacy-event-${randomUUID()}`, summary });

    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
  }, 300000);

  it('keeps the channel active when the collection tag is unchanged', async () => {
    await syncCalendarChannel();
    await syncCalendarChannel();

    expect((await readChannel()).syncStatus).toBe(
      CalendarChannelSyncStatus.ACTIVE,
    );
  }, 300000);
});
