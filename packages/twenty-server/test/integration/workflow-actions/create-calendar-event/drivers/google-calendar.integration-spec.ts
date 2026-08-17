import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';

const HANDLE = 'google-calendar-create-event-action@apple.dev';
const ATTENDEE = 'to-recipient@example.com';

describe('CREATE_CALENDAR_EVENT workflow action on Google Calendar (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('creates an event with a title resolved from the trigger payload', async () => {
    const title = `Gmail workflow calendar ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Gmail create calendar event workflow',
      stepType: 'CREATE_CALENDAR_EVENT',
      input: {
        connectedAccountId: channel.connectedAccountId,
        title: '{{trigger.title}}',
        description: 'Planning meeting',
        location: 'Room 101',
        startsAt: '2026-08-13T09:00:00Z',
        endsAt: '2026-08-13T10:00:00Z',
        isFullDay: false,
        timeZone: 'UTC',
        attendees: ATTENDEE,
        sendInvitations: true,
        addConferencing: true,
      },
      payload: { title },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      title,
      iCalUid: expect.stringContaining('@google.com'),
      attendeeCount: 1,
      connectedAccountId: channel.connectedAccountId,
    });
    expect(google.createdCalendarEvents).toEqual([
      expect.objectContaining({
        summary: title,
        description: 'Planning meeting',
        location: 'Room 101',
        attendees: [expect.objectContaining({ email: ATTENDEE })],
        conferenceData: expect.objectContaining({
          createRequest: expect.any(Object),
        }),
      }),
    ]);
    expect(await findImportedCalendarEventTitles([title])).toEqual([title]);
  }, 60000);
});
