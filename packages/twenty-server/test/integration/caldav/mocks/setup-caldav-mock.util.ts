import { http, HttpResponse } from 'msw';

import { setupHttpMock } from 'test/integration/utils/http-mock.util';

export const CALDAV_HOST = 'caldav.acme-test.com';
export const CALDAV_SERVER_URL = `https://${CALDAV_HOST}`;

const PRINCIPAL_PATH = '/principals/user/';
const CALENDAR_HOME_PATH = '/calendars/user/';
const CALENDAR_PATH = '/calendars/user/personal/';

const xml = (body: string) =>
  new HttpResponse(`<?xml version="1.0" encoding="utf-8"?>${body}`, {
    status: 207,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });

const OK = '<d:status>HTTP/1.1 200 OK</d:status>';

const principalResponse = () =>
  xml(`
    <d:multistatus xmlns:d="DAV:">
      <d:response>
        <d:href>/</d:href>
        <d:propstat>
          <d:prop>
            <d:current-user-principal><d:href>${PRINCIPAL_PATH}</d:href></d:current-user-principal>
            <d:principal-URL><d:href>${PRINCIPAL_PATH}</d:href></d:principal-URL>
          </d:prop>
          ${OK}
        </d:propstat>
      </d:response>
    </d:multistatus>`);

const calendarHomeResponse = () =>
  xml(`
    <d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
      <d:response>
        <d:href>${PRINCIPAL_PATH}</d:href>
        <d:propstat>
          <d:prop>
            <c:calendar-home-set><d:href>${CALENDAR_HOME_PATH}</d:href></c:calendar-home-set>
          </d:prop>
          ${OK}
        </d:propstat>
      </d:response>
    </d:multistatus>`);

const calendarCollectionResponse = (syncToken: string) =>
  xml(`
    <d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/">
      <d:response>
        <d:href>${CALENDAR_PATH}</d:href>
        <d:propstat>
          <d:prop>
            <d:resourcetype><d:collection/><c:calendar/></d:resourcetype>
            <d:displayname>Personal</d:displayname>
            <c:supported-calendar-component-set>
              <c:comp name="VEVENT"/>
            </c:supported-calendar-component-set>
            <cs:getctag>${syncToken}</cs:getctag>
            <d:sync-token>${syncToken}</d:sync-token>
          </d:prop>
          ${OK}
        </d:propstat>
      </d:response>
    </d:multistatus>`);

const syncCollectionResponse = (events: CalDavMockEvent[], syncToken: string) =>
  xml(`
    <d:multistatus xmlns:d="DAV:">
      ${events
        .map(
          (event) => `
      <d:response>
        <d:href>${CALENDAR_PATH}${event.uid}.ics</d:href>
        <d:propstat>
          <d:prop><d:getetag>"${event.uid}-etag"</d:getetag></d:prop>
          ${OK}
        </d:propstat>
      </d:response>`,
        )
        .join('')}
      <d:sync-token>${syncToken}</d:sync-token>
    </d:multistatus>`);

const calendarDataResponse = (events: CalDavMockEvent[]) =>
  xml(`
    <d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
      ${events
        .map(
          (event) => `
      <d:response>
        <d:href>${CALENDAR_PATH}${event.uid}.ics</d:href>
        <d:propstat>
          <d:prop>
            <d:getetag>"${event.uid}-etag"</d:getetag>
            <c:calendar-data>${icalEvent(event)}</c:calendar-data>
          </d:prop>
          ${OK}
        </d:propstat>
      </d:response>`,
        )
        .join('')}
    </d:multistatus>`);

const icalEvent = ({ uid, summary, attendee }: CalDavMockEvent) =>
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
    'ORGANIZER;CN=Organizer:mailto:organizer@acme-test.com',
    ...(attendee
      ? [`ATTENDEE;CN=Attendee;PARTSTAT=ACCEPTED:mailto:${attendee}`]
      : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

export type CalDavMockEvent = {
  uid: string;
  summary: string;
  attendee?: string;
};

export type CalDavMock = {
  serveEvents: (events: CalDavMockEvent[], syncToken?: string) => void;
  failWith: (status: number, body?: string) => void;
};

// tsdav discovers the server in three PROPFINDs (principal, calendar home,
// calendar collections) and then issues REPORTs: sync-collection for the
// changed hrefs and calendar-multiget for the iCal payloads. The handler routes
// on method plus request body because msw has no PROPFIND/REPORT helpers.
export const setupCalDavMock = (): CalDavMock => {
  let servedEvents: CalDavMockEvent[] = [];
  let currentSyncToken = 'sync-token-1';

  const davHandler = http.all(`${CALDAV_SERVER_URL}/*`, async ({ request }) => {
    const url = new URL(request.url);
    const body = await request.text();

    if (request.method === 'PROPFIND') {
      if (body.includes('current-user-principal')) {
        return principalResponse();
      }

      if (body.includes('calendar-home-set')) {
        return calendarHomeResponse();
      }

      return calendarCollectionResponse(currentSyncToken);
    }

    if (request.method === 'REPORT') {
      if (body.includes('sync-collection')) {
        return syncCollectionResponse(servedEvents, currentSyncToken);
      }

      return calendarDataResponse(servedEvents);
    }

    return HttpResponse.text(`Unexpected CalDAV request to ${url.pathname}`, {
      status: 405,
    });
  });

  const httpMock = setupHttpMock(davHandler);

  return {
    serveEvents: (events, syncToken = `sync-token-${events.length + 1}`) => {
      servedEvents = events;
      currentSyncToken = syncToken;
      httpMock.use(davHandler);
    },
    failWith: (status, body = 'CalDAV failure') =>
      httpMock.use(
        http.all(`${CALDAV_SERVER_URL}/*`, () =>
          HttpResponse.text(body, { status }),
        ),
      ),
  };
};
