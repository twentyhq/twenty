import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import {
  type CalDavProxy,
  startCalDavResponseRewritingProxy,
} from 'test/integration/utils/start-caldav-response-rewriting-proxy.util';
import {
  type RadicaleServer,
  startRadicaleContainer,
} from 'test/integration/utils/start-radicale-container.util';

const HANDLE = `caldav-create-event-action-${randomUUID()}@acme.test`;
const COLLECTION = 'personal';
const PASSWORD = 'radicale-password';
const ATTENDEE = 'attendee@example.com';

const CALENDAR_USER_ADDRESS_HREF =
  /(<((?:[\w.-]+:)?)calendar-user-address-set\b[^>]*>\s*<((?:[\w.-]+:)?)href>)[^<]*(<\/\3href>)/g;

const authorizationHeader = `Basic ${Buffer.from(`${HANDLE}:${PASSWORD}`).toString('base64')}`;

type CalendarEventWithParticipants = {
  calendarEventParticipants: {
    edges: { node: { handle: string; isOrganizer: boolean } }[];
  };
};

describe('CREATE_CALENDAR_EVENT workflow action on CalDAV (integration)', () => {
  let radicale: RadicaleServer;
  let proxy: CalDavProxy;
  let connectedAccountId: string;
  let serverCalendarUserAddress: string | undefined;

  const collectionUrl = () =>
    `http://${radicale.host}:${radicale.port}/${HANDLE}/${COLLECTION}/`;

  const runCreateCalendarEvent = (title: string) =>
    runWorkflowActionStep({
      name: 'CalDAV create calendar event workflow',
      stepType: 'CREATE_CALENDAR_EVENT',
      input: {
        connectedAccountId,
        title,
        startsAt: '2026-08-14T09:00:00Z',
        endsAt: '2026-08-14T10:00:00Z',
        isFullDay: false,
        timeZone: 'UTC',
        attendees: ATTENDEE,
        sendInvitations: true,
        addConferencing: false,
      },
    });

  const fetchStoredOrganizer = async (
    stepResult: Record<string, unknown> | undefined,
  ) => {
    const response = await fetch(
      `${collectionUrl()}${stepResult?.iCalUid}.ics`,
      {
        headers: { Authorization: authorizationHeader },
      },
    );

    const unfoldedICalendar = (await response.text()).replace(/\r\n[ \t]/g, '');

    return /^ORGANIZER[^:]*:mailto:(.+)$/m.exec(unfoldedICalendar)?.[1]?.trim();
  };

  beforeAll(async () => {
    // The SSRF guard would otherwise reject the container's private address.
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

    proxy = await startCalDavResponseRewritingProxy({
      targetHost: radicale.host,
      targetPort: radicale.port,
      rewriteResponseBody: (body) =>
        isDefined(serverCalendarUserAddress)
          ? body.replace(
              CALENDAR_USER_ADDRESS_HREF,
              `$1mailto:${serverCalendarUserAddress}$4`,
            )
          : body,
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
  }, 300000);

  afterEach(() => {
    serverCalendarUserAddress = undefined;
  });

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

  it('creates an event in the CalDAV collection with a title resolved from the trigger payload', async () => {
    const title = `CalDAV workflow calendar ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'CalDAV create calendar event workflow',
      stepType: 'CREATE_CALENDAR_EVENT',
      input: {
        connectedAccountId,
        title: '{{trigger.title}}',
        description: 'Planning meeting',
        location: 'Room 101',
        startsAt: '2026-08-13T09:00:00Z',
        endsAt: '2026-08-13T10:00:00Z',
        isFullDay: false,
        timeZone: 'UTC',
        attendees: ATTENDEE,
        sendInvitations: true,
        addConferencing: false,
      },
      payload: { title },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      title,
      iCalUid: expect.any(String),
      attendeeCount: 1,
      connectedAccountId,
    });
    expect(await findImportedCalendarEventTitles([title])).toEqual([title]);

    const response = await fetch(
      `${collectionUrl()}${workflowRun.stepResult?.iCalUid}.ics`,
      { headers: { Authorization: authorizationHeader } },
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain(`SUMMARY:${title}`);
  }, 300000);

  it('makes the account handle the organizer when the server lists no mailto calendar user address', async () => {
    const workflowRun = await runCreateCalendarEvent(
      `CalDAV organizer fallback ${randomUUID()}`,
    );

    expect(workflowRun.stepStatus).toBe('SUCCESS');
    expect(await fetchStoredOrganizer(workflowRun.stepResult)).toBe(HANDLE);
  }, 300000);

  it('makes the server calendar user address the organizer so the server sends the invitations', async () => {
    serverCalendarUserAddress = `scheduling-${randomUUID()}@acme.test`;

    const title = `CalDAV scheduling organizer ${randomUUID()}`;
    const workflowRun = await runCreateCalendarEvent(title);

    expect(workflowRun.stepStatus).toBe('SUCCESS');
    expect(await fetchStoredOrganizer(workflowRun.stepResult)).toBe(
      serverCalendarUserAddress,
    );

    const [calendarEvent] =
      await findRecordNodesByFilter<CalendarEventWithParticipants>(
        'calendarEvent',
        'calendarEvents',
        'calendarEventParticipants { edges { node { handle isOrganizer } } }',
        { title: { eq: title } },
      );

    expect(
      calendarEvent.calendarEventParticipants.edges
        .map(({ node }) => node)
        .sort((left, right) => left.handle.localeCompare(right.handle)),
    ).toEqual([
      { handle: ATTENDEE, isOrganizer: false },
      { handle: serverCalendarUserAddress, isOrganizer: true },
    ]);
  }, 300000);
});
