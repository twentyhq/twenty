import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import {
  type RadicaleServer,
  startRadicaleContainer,
} from 'test/integration/utils/start-radicale-container.util';

const HANDLE = `caldav-workflow-${randomUUID()}@acme.test`;
const COLLECTION = 'personal';
const PASSWORD = 'radicale-password';
const ATTENDEE = 'attendee@example.com';

const authorizationHeader = `Basic ${Buffer.from(`${HANDLE}:${PASSWORD}`).toString('base64')}`;

describe('CalDAV workflow calendar event action (integration)', () => {
  let radicale: RadicaleServer;
  let connectedAccountId: string;

  const collectionUrl = () =>
    `http://${radicale.host}:${radicale.port}/${HANDLE}/${COLLECTION}/`;

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

    await radicale?.stop().catch(() => undefined);
  });

  it('creates an event in the CalDAV collection from a CREATE_CALENDAR_EVENT step', async () => {
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
});
