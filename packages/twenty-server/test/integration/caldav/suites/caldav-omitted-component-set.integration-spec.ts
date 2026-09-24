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
  type CalDavProxy,
  startCalDavProxyOmittingComponentSet,
} from 'test/integration/utils/start-caldav-proxy-omitting-component-set.util';
import {
  type RadicaleServer,
  startRadicaleContainer,
} from 'test/integration/utils/start-radicale-container.util';

const HANDLE = `caldav-omitted-component-set-${randomUUID()}@acme.test`;
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

describe('CalDAV server omitting supported-calendar-component-set (integration)', () => {
  let radicale: RadicaleServer;
  let proxy: CalDavProxy;
  let connectedAccountId: string;
  let calendarChannelId: string;

  const collectionUrl = () =>
    `http://${radicale.host}:${radicale.port}/${HANDLE}/${COLLECTION}/`;

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
          </prop></set>
        </mkcol>`,
    });

    proxy = await startCalDavProxyOmittingComponentSet({
      targetHost: radicale.host,
      targetPort: radicale.port,
    });

    const { data } = await saveImapSmtpCaldavAccount({
      input: {
        handle: HANDLE,
        connectionParameters: {
          CALDAV: {
            host: proxy.url,
            port: Number(new URL(proxy.url).port),
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

  it('serves the calendar collection without a component set', async () => {
    const response = await fetch(`${proxy.url}/${HANDLE}/`, {
      method: 'PROPFIND',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Authorization: authorizationHeader,
        Depth: '1',
      },
      body: `<?xml version="1.0" encoding="utf-8"?>
        <propfind xmlns="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
          <prop><resourcetype/><c:supported-calendar-component-set/></prop>
        </propfind>`,
    });

    const body = await response.text();

    expect(body).toContain('calendar');
    expect(body).not.toContain('supported-calendar-component-set');
  }, 300000);

  it('imports an event even though the component set is not published', async () => {
    const summary = `CalDAV event ${randomUUID()}`;
    const uid = `caldav-event-${randomUUID()}`;

    await fetch(`${collectionUrl()}${uid}.ics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        Authorization: authorizationHeader,
      },
      body: icalEvent({ uid, summary }),
    });

    await runCalendarChannelListFetch(calendarChannelId);
    await runCalendarChannelEventsImport(calendarChannelId);

    expect(await findImportedCalendarEventTitles([summary])).toEqual([summary]);
  }, 300000);
});
