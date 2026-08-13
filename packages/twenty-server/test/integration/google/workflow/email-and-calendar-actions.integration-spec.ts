import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';

const HANDLE = 'gmail-workflow-actions@apple.dev';
const RECIPIENTS = {
  to: 'to-recipient@example.com',
  cc: 'cc-recipient@example.com',
  bcc: 'bcc-recipient@example.com',
};

describe('Gmail workflow email and calendar actions (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  beforeEach(() => {
    google.sentMessages.length = 0;
    google.draftMessages.length = 0;
    google.createdCalendarEvents.length = 0;
  });

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('sends an email from a SEND_EMAIL step with recipients resolved from the trigger payload', async () => {
    const subject = `Gmail workflow send ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Gmail send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId: channel.connectedAccountId,
        recipients: {
          to: '{{trigger.to}}',
          cc: '{{trigger.cc}}',
          bcc: '{{trigger.bcc}}',
        },
        subject: '{{trigger.subject}}',
        body: '<p>Gmail workflow body</p>',
      },
      payload: { ...RECIPIENTS, subject },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      recipients: [RECIPIENTS.to],
      ccRecipients: [RECIPIENTS.cc],
      bccRecipients: [RECIPIENTS.bcc],
      subject,
      connectedAccountId: channel.connectedAccountId,
      messageId: expect.any(String),
      messageThreadId: expect.any(String),
    });
    expect(google.sentMessages).toHaveLength(1);

    const [{ raw }] = google.sentMessages;

    expect(raw).toContain(`To: ${RECIPIENTS.to}`);
    expect(raw).toContain(`Cc: ${RECIPIENTS.cc}`);
    expect(raw).toContain(`Bcc: ${RECIPIENTS.bcc}`);
    expect(raw).toContain(`Subject: ${subject}`);

    const [message] = await findRecordNodesByFilter<{
      id: string;
      isDraft: boolean;
      text: string | null;
    }>('message', 'messages', 'id isDraft text', {
      subject: { eq: subject },
    });

    expect(message).toMatchObject({
      isDraft: false,
      text: 'Gmail workflow body',
    });
    expect(
      await findRecordNodesByFilter<{ messageChannelId: string }>(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        'messageChannelId',
        { messageId: { eq: message.id } },
      ),
    ).toEqual([
      expect.objectContaining({ messageChannelId: channel.channelId }),
    ]);
    expect(
      await findRecordNodesByFilter<{ handle: string; role: string }>(
        'messageParticipant',
        'messageParticipants',
        'handle role',
        { messageId: { eq: message.id } },
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ handle: RECIPIENTS.to, role: 'TO' }),
        expect.objectContaining({ handle: RECIPIENTS.cc, role: 'CC' }),
        expect.objectContaining({ handle: RECIPIENTS.bcc, role: 'BCC' }),
      ]),
    );
  }, 60000);

  it('creates a Gmail draft from a DRAFT_EMAIL step without sending or persisting it', async () => {
    const subject = `Gmail workflow draft ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Gmail draft email workflow',
      stepType: 'DRAFT_EMAIL',
      input: {
        connectedAccountId: channel.connectedAccountId,
        recipients: {
          to: '{{trigger.to}}',
          cc: '{{trigger.cc}}',
          bcc: '{{trigger.bcc}}',
        },
        subject: '{{trigger.subject}}',
        body: '<p>Gmail workflow draft body</p>',
      },
      payload: { ...RECIPIENTS, subject },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      recipients: [RECIPIENTS.to],
      ccRecipients: [RECIPIENTS.cc],
      bccRecipients: [RECIPIENTS.bcc],
      subject,
      connectedAccountId: channel.connectedAccountId,
    });
    expect(google.draftMessages).toHaveLength(1);

    const [{ raw }] = google.draftMessages;

    expect(raw).toContain(`To: ${RECIPIENTS.to}`);
    expect(raw).toContain(`Cc: ${RECIPIENTS.cc}`);
    expect(raw).toContain(`Bcc: ${RECIPIENTS.bcc}`);
    expect(raw).toContain(`Subject: ${subject}`);
    expect(google.sentMessages).toEqual([]);
    expect(
      await findRecordNodesByFilter<{ id: string }>(
        'message',
        'messages',
        'id',
        {
          subject: { eq: subject },
        },
      ),
    ).toEqual([]);
  }, 60000);

  it('creates a Google calendar event from a CREATE_CALENDAR_EVENT step', async () => {
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
        attendees: RECIPIENTS.to,
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
        attendees: [expect.objectContaining({ email: RECIPIENTS.to })],
        conferenceData: expect.objectContaining({
          createRequest: expect.any(Object),
        }),
      }),
    ]);
    expect(await findImportedCalendarEventTitles([title])).toEqual([title]);
  }, 60000);
});
