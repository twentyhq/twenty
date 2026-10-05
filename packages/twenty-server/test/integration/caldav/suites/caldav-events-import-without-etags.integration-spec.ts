import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import {
  type NonCompliantCalDavProxy,
  startNonCompliantCalDavProxy,
} from 'test/integration/utils/start-non-compliant-caldav-proxy.util';
import {
  type RadicaleServer,
  startRadicaleContainer,
} from 'test/integration/utils/start-radicale-container.util';

const HANDLE = `caldav-no-etag-${randomUUID()}@acme.test`;
const COLLECTION = 'personal';
const PASSWORD = 'radicale-password';

const authorizationHeader = `Basic ${Buffer.from(`${HANDLE}:${PASSWORD}`).toString('base64')}`;

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

describe('CalDAV calendar events import without entity tags (integration)', () => {
  let radicale: RadicaleServer;
  let proxy: NonCompliantCalDavProxy;
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

  const syncCalendarChannel = async () => {
    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: ['*'] },
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

    proxy = await startNonCompliantCalDavProxy({
      targetHost: radicale.host,
      targetPort: radicale.port,
    });

    const { data } = await saveImapSmtpCaldavAccount({
      input: {
        handle: HANDLE,
        connectionParameters: {
          CALDAV: {
            host: `http://${proxy.host}:${proxy.port}`,
            port: proxy.port,
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
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    }).catch(() => undefined);

    if (isNonEmptyString(connectedAccountId)) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }

    await proxy?.stop().catch(() => undefined);
    await radicale?.stop().catch(() => undefined);
  });

  afterEach(() => {
    proxy.degradations.blankLastModified = false;
    proxy.degradations.hideCollectionMembers = false;
  });

  it('imports an event when the server never returns an entity tag', async () => {
    const summary = `CalDAV untagged event ${randomUUID()}`;

    await putEvent({ uid: `caldav-event-${randomUUID()}`, summary });

    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
  }, 300000);

  it('imports an event added after the collection tag advances', async () => {
    const firstSummary = `CalDAV untagged event ${randomUUID()}`;
    const secondSummary = `CalDAV untagged event ${randomUUID()}`;

    await putEvent({
      uid: `caldav-event-${randomUUID()}`,
      summary: firstSummary,
    });
    await syncCalendarChannel();

    await putEvent({
      uid: `caldav-event-${randomUUID()}`,
      summary: secondSummary,
    });
    await syncCalendarChannel();

    expect(
      await findImportedCalendarEventTitles([firstSummary, secondSummary]),
    ).toEqual([firstSummary, secondSummary].sort());
  }, 300000);

  it('re-imports the collection after a listing comes back with no members', async () => {
    const importedSummary = `CalDAV untagged event ${randomUUID()}`;
    const addedSummary = `CalDAV untagged event ${randomUUID()}`;

    await putEvent({
      uid: `caldav-event-${randomUUID()}`,
      summary: importedSummary,
    });
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([importedSummary])).toEqual([
      importedSummary,
    ]);

    proxy.degradations.hideCollectionMembers = true;

    await putEvent({
      uid: `caldav-event-${randomUUID()}`,
      summary: addedSummary,
    });
    await syncCalendarChannel();

    expect(
      await findImportedCalendarEventTitles([importedSummary, addedSummary]),
    ).toEqual([]);

    proxy.degradations.hideCollectionMembers = false;

    await syncCalendarChannel();

    expect(
      await findImportedCalendarEventTitles([importedSummary, addedSummary]),
    ).toEqual([importedSummary, addedSummary].sort());
  }, 300000);

  it('imports an edit when the server returns neither entity tag nor last modified date', async () => {
    const uid = `caldav-event-${randomUUID()}`;
    const originalSummary = `CalDAV unversioned event ${randomUUID()}`;
    const editedSummary = `CalDAV unversioned event ${randomUUID()}`;

    proxy.degradations.blankLastModified = true;

    await putEvent({ uid, summary: originalSummary });
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([originalSummary])).toEqual([
      originalSummary,
    ]);

    await putEvent({ uid, summary: editedSummary });
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([editedSummary])).toEqual([
      editedSummary,
    ]);
  }, 300000);
});
