import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { Network, type StartedNetwork } from 'testcontainers';

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
const PASSWORD = 'radicale-password';
const RADICALE_NETWORK_ALIAS = 'radicale';

const LAST_MODIFIED_COLLECTION = 'lastmodified';
const NO_CHANGE_SIGNAL_COLLECTION = 'nosignals';
const EMPTY_COLLECTION = 'vacant';

const HTTP_DATE_RESOLUTION_MS = 1100;

const authorizationHeader = `Basic ${Buffer.from(`${HANDLE}:${PASSWORD}`).toString('base64')}`;

type CalDavSyncCursorSnapshot = {
  ctags?: Record<string, string>;
  etags?: Record<string, Record<string, string>>;
};

const waitForNextHttpDateSecond = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, HTTP_DATE_RESOLUTION_MS);
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
  let network: StartedNetwork;
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

  const readSyncCursorSnapshot =
    async (): Promise<CalDavSyncCursorSnapshot> => {
      const syncCursor = await readSyncCursor();

      if (!isNonEmptyString(syncCursor)) {
        return {};
      }

      return JSON.parse(syncCursor);
    };

  const readCollectionsWithCachedTag = async (): Promise<string[]> =>
    Object.keys((await readSyncCursorSnapshot()).ctags ?? {});

  const readChangeSignals = async (collection: string): Promise<string[]> => {
    const { etags } = await readSyncCursorSnapshot();

    const collectionEntry = Object.entries(etags ?? {}).find(([url]) =>
      url.endsWith(`/${collection}/`),
    );

    return Object.values(collectionEntry?.[1] ?? {});
  };

  const syncCalendarChannel = async () => {
    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    network = await new Network().start();

    radicale = await startRadicaleContainer({
      username: HANDLE,
      password: PASSWORD,
      network,
      networkAlias: RADICALE_NETWORK_ALIAS,
    });

    proxy = await startEtaglessCalDavProxy({
      network,
      upstreamUrl: `http://${RADICALE_NETWORK_ALIAS}:${radicale.internalPort}`,
      collectionWithoutLastModified: NO_CHANGE_SIGNAL_COLLECTION,
    });

    await createCollection(LAST_MODIFIED_COLLECTION);
    await createCollection(NO_CHANGE_SIGNAL_COLLECTION);
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
    await network?.stop().catch(() => undefined);
  });

  it('imports events when the server omits getetag but reports a last modified time', async () => {
    const summary = `CalDAV event ${randomUUID()}`;

    await putEvent({
      collection: LAST_MODIFIED_COLLECTION,
      uid: `caldav-event-${randomUUID()}`,
      summary,
    });

    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
    expect(await readChangeSignals(LAST_MODIFIED_COLLECTION)).toEqual([
      expect.stringMatching(/GMT$/),
    ]);
  }, 300000);

  it('re-imports an event edited in place once its last modified time moves', async () => {
    const uid = `caldav-event-${randomUUID()}`;
    const summaryBeforeEdit = `CalDAV event ${randomUUID()}`;
    const summaryAfterEdit = `CalDAV event ${randomUUID()}`;

    await putEvent({
      collection: LAST_MODIFIED_COLLECTION,
      uid,
      summary: summaryBeforeEdit,
    });
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summaryBeforeEdit])).toEqual([
      summaryBeforeEdit,
    ]);

    await waitForNextHttpDateSecond();
    await putEvent({
      collection: LAST_MODIFIED_COLLECTION,
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

  it('imports events when the server omits every per-resource change signal', async () => {
    const summary = `CalDAV event ${randomUUID()}`;

    await putEvent({
      collection: NO_CHANGE_SIGNAL_COLLECTION,
      uid: `caldav-event-${randomUUID()}`,
      summary,
    });

    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
    expect(await readChangeSignals(NO_CHANGE_SIGNAL_COLLECTION)).toEqual([
      expect.stringMatching(/\.ics:/),
    ]);
  }, 300000);

  it('re-imports an event without change signals once the collection tag moves', async () => {
    const uid = `caldav-event-${randomUUID()}`;
    const summaryBeforeEdit = `CalDAV event ${randomUUID()}`;
    const summaryAfterEdit = `CalDAV event ${randomUUID()}`;

    await putEvent({
      collection: NO_CHANGE_SIGNAL_COLLECTION,
      uid,
      summary: summaryBeforeEdit,
    });
    await syncCalendarChannel();

    expect(await findImportedCalendarEventTitles([summaryBeforeEdit])).toEqual([
      summaryBeforeEdit,
    ]);

    await putEvent({
      collection: NO_CHANGE_SIGNAL_COLLECTION,
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
        url.endsWith(`/${LAST_MODIFIED_COLLECTION}/`),
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
