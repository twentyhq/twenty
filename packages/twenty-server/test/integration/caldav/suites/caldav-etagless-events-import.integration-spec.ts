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
  type EtaglessCalDavProxy,
  startEtaglessCalDavProxy,
} from 'test/integration/utils/start-etagless-caldav-proxy.util';
import {
  type RadicaleServer,
  startRadicaleContainer,
} from 'test/integration/utils/start-radicale-container.util';

const HANDLE = `caldav-etagless-import-${randomUUID()}@acme.test`;
const POPULATED_COLLECTION = 'personal';
const EMPTY_COLLECTION = 'vacant';
const PASSWORD = 'radicale-password';

const authorizationHeader = `Basic ${Buffer.from(`${HANDLE}:${PASSWORD}`).toString('base64')}`;

type CalDavSyncCursorSnapshot = {
  ctags?: Record<string, string>;
};

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

const calendarCollectionBody = (displayName: string) =>
  `<?xml version="1.0" encoding="utf-8"?>
    <mkcol xmlns="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
      <set><prop>
        <resourcetype><collection/><c:calendar/></resourcetype>
        <displayname>${displayName}</displayname>
        <c:supported-calendar-component-set><c:comp name="VEVENT"/></c:supported-calendar-component-set>
      </prop></set>
    </mkcol>`;

describe('CalDAV events import from a server that omits getetag (integration)', () => {
  let radicale: RadicaleServer;
  let proxy: EtaglessCalDavProxy;
  let connectedAccountId: string;
  let calendarChannelId: string;

  const collectionUrl = (collection: string) =>
    `http://${radicale.host}:${radicale.port}/${HANDLE}/${collection}/`;

  const createCollection = async (collection: string) =>
    fetch(collectionUrl(collection), {
      method: 'MKCOL',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Authorization: authorizationHeader,
      },
      body: calendarCollectionBody(collection),
    });

  const putEvent = async ({
    collection,
    uid,
    summary,
  }: {
    collection: string;
    uid: string;
    summary: string;
  }) =>
    fetch(`${collectionUrl(collection)}${uid}.ics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        Authorization: authorizationHeader,
      },
      body: icalEvent({ uid, summary }),
    });

  const readSyncCursor = async () =>
    (
      await getCoreRepository<CalendarChannelEntity>(
        CalendarChannelEntity,
      ).findOneByOrFail({ id: calendarChannelId })
    ).syncCursor;

  const readCollectionsWithCachedTag = async (): Promise<string[]> => {
    const syncCursor = await readSyncCursor();

    if (!isNonEmptyString(syncCursor)) {
      return [];
    }

    const parsedSyncCursor: CalDavSyncCursorSnapshot = JSON.parse(syncCursor);

    return Object.keys(parsedSyncCursor.ctags ?? {});
  };

  const syncCalendarChannel = async () => {
    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    radicale = await startRadicaleContainer({
      username: HANDLE,
      password: PASSWORD,
    });

    proxy = await startEtaglessCalDavProxy({
      upstreamHost: radicale.host,
      upstreamPort: radicale.port,
    });

    await createCollection(POPULATED_COLLECTION);
    await createCollection(EMPTY_COLLECTION);

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
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: true },
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

  it('imports events when the server returns no etag on the collection listing', async () => {
    const summary = `CalDAV event ${randomUUID()}`;

    await putEvent({
      collection: POPULATED_COLLECTION,
      uid: `caldav-event-${randomUUID()}`,
      summary,
    });

    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
  }, 300000);

  it('re-imports an event edited in place on a server without per-resource change signals', async () => {
    const uid = `caldav-event-${randomUUID()}`;
    const summaryBeforeEdit = `CalDAV event ${randomUUID()}`;
    const summaryAfterEdit = `CalDAV event ${randomUUID()}`;

    await putEvent({
      collection: POPULATED_COLLECTION,
      uid,
      summary: summaryBeforeEdit,
    });
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summaryBeforeEdit])).toEqual([
      summaryBeforeEdit,
    ]);

    await putEvent({
      collection: POPULATED_COLLECTION,
      uid,
      summary: summaryAfterEdit,
    });
    await syncCalendarChannel();

    expect(
      await findImportedCalendarEventTitles([
        summaryBeforeEdit,
        summaryAfterEdit,
      ]),
    ).toEqual([summaryAfterEdit]);
  }, 300000);

  it('keeps rescanning a collection whose listing collected no resources', async () => {
    await syncCalendarChannel();

    const collectionsWithCachedTag = await readCollectionsWithCachedTag();

    expect(
      collectionsWithCachedTag.filter((url) =>
        url.endsWith(`/${POPULATED_COLLECTION}/`),
      ),
    ).toHaveLength(1);
    expect(
      collectionsWithCachedTag.filter((url) =>
        url.endsWith(`/${EMPTY_COLLECTION}/`),
      ),
    ).toEqual([]);

    const summary = `CalDAV event ${randomUUID()}`;

    await putEvent({
      collection: EMPTY_COLLECTION,
      uid: `caldav-event-${randomUUID()}`,
      summary,
    });
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
  }, 300000);
});
