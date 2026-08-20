import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';

const HANDLE = 'microsoft-calendar-create-event-action@apple.dev';
const ATTENDEE = 'to-recipient@example.com';

describe('CREATE_CALENDAR_EVENT workflow action on Microsoft Calendar (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('creates an event with a title resolved from the trigger payload', async () => {
    const title = `Microsoft workflow calendar ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Microsoft create calendar event workflow',
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
      iCalUid: expect.stringContaining('@microsoft.com'),
      attendeeCount: 1,
      connectedAccountId: channel.connectedAccountId,
    });
    expect(microsoft.createdCalendarEvents).toEqual([
      expect.objectContaining({
        subject: title,
        location: { displayName: 'Room 101' },
        attendees: [{ emailAddress: { address: ATTENDEE }, type: 'required' }],
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
      }),
    ]);
    expect(await findImportedCalendarEventTitles([title])).toEqual([title]);
  }, 60000);
});
