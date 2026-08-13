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
  type RadicaleServer,
  startRadicaleContainer,
} from 'test/integration/utils/start-radicale-container.util';

const HANDLE = `caldav-events-import-${randomUUID()}@acme.test`;
const COLLECTION = 'personal';
const PASSWORD = 'radicale-password';

const authorizationHeader = `Basic ${Buffer.from(`${HANDLE}:${PASSWORD}`).toString('base64')}`;

// A sync token the server no longer recognises, which drives the fallback from
// an incremental sync-collection report to a full re-sync.
const STALE_SYNC_CURSOR = JSON.stringify({
  syncTokens: { 'http://caldav.invalid/collection/': 'stale-sync-token' },
});

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

describe('CalDAV calendar events import (integration)', () => {
  let radicale: RadicaleServer;
  let connectedAccountId: string;
  let calendarChannelId: string;

  const collectionUrl = () =>
    `http://${radicale.host}:${radicale.port}/${HANDLE}/${COLLECTION}/`;

  const putEvent = async ({ uid, summary }: { uid: string; summary: string }) =>
    fetch(`${collectionUrl()}${uid}.ics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        Authorization: authorizationHeader,
      },
      body: icalEvent({ uid, summary }),
    });

  const deleteEvent = async (uid: string) =>
    fetch(`${collectionUrl()}${uid}.ics`, {
      method: 'DELETE',
      headers: { Authorization: authorizationHeader },
    });

  const readSyncCursor = async () =>
    (
      await getCoreRepository<CalendarChannelEntity>(
        CalendarChannelEntity,
      ).findOneByOrFail({ id: calendarChannelId })
    ).syncCursor;

  const syncCalendarChannel = async () => {
    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);
  };

  beforeAll(async () => {
    // The CalDAV driver wraps its fetch in the SSRF guard, which rejects the
    // container's private address before the request is made.
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    radicale = await startRadicaleContainer({
      username: HANDLE,
      password: PASSWORD,
    });

    await fetch(collectionUrl(), {
      method: 'MKCOL',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Authorization: authorizationHeader,
      },
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
            host: `http://${radicale.host}:${radicale.port}`,
            port: radicale.port,
            username: HANDLE,
            password: PASSWORD,
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

    await radicale?.stop().catch(() => undefined);
  });

  it('imports an event published to the CalDAV collection', async () => {
    const summary = `CalDAV event ${randomUUID()}`;

    await putEvent({ uid: `caldav-event-${randomUUID()}`, summary });

    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
  }, 300000);

  it('advances the sync token and imports an event added afterwards', async () => {
    const firstSummary = `CalDAV event ${randomUUID()}`;
    const secondSummary = `CalDAV event ${randomUUID()}`;

    await putEvent({
      uid: `caldav-event-${randomUUID()}`,
      summary: firstSummary,
    });
    await syncCalendarChannel();

    const cursorAfterFirstSync = await readSyncCursor();

    await putEvent({
      uid: `caldav-event-${randomUUID()}`,
      summary: secondSummary,
    });
    await syncCalendarChannel();

    expect(await readSyncCursor()).not.toBe(cursorAfterFirstSync);
    expect(
      await findImportedCalendarEventTitles([firstSummary, secondSummary]),
    ).toEqual([firstSummary, secondSummary].sort());
  }, 300000);

  it('keeps the channel active when the collection has not changed', async () => {
    await syncCalendarChannel();

    const channel = await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).findOneByOrFail({ id: calendarChannelId });

    expect(channel.syncStatus).toBe(CalendarChannelSyncStatus.ACTIVE);
  }, 300000);

  it('removes an event deleted from the CalDAV collection', async () => {
    const summary = `CalDAV event ${randomUUID()}`;
    const uid = `caldav-event-${randomUUID()}`;

    await putEvent({ uid, summary });
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);

    await deleteEvent(uid);
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([]);
  }, 300000);

  it('recovers with a full re-sync when the stored sync token is rejected', async () => {
    const summary = `CalDAV event ${randomUUID()}`;

    await putEvent({ uid: `caldav-event-${randomUUID()}`, summary });

    await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).update({ id: calendarChannelId }, { syncCursor: STALE_SYNC_CURSOR });

    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
  }, 300000);
});
