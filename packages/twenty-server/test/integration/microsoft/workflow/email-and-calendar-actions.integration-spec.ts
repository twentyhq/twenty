import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';

const HANDLE = 'microsoft-workflow-actions@apple.dev';
const RECIPIENTS = {
  to: 'to-recipient@example.com',
  cc: 'cc-recipient@example.com',
  bcc: 'bcc-recipient@example.com',
};

describe('Microsoft workflow email and calendar actions (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 60000);

  beforeEach(() => {
    microsoft.createdMessages.length = 0;
    microsoft.sentMessageIds.length = 0;
    microsoft.createdCalendarEvents.length = 0;
  });

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('sends an email from a SEND_EMAIL step with recipients resolved from the trigger payload', async () => {
    const subject = `Microsoft workflow send ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Microsoft send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId: channel.connectedAccountId,
        recipients: {
          to: '{{trigger.to}}',
          cc: '{{trigger.cc}}',
          bcc: '{{trigger.bcc}}',
        },
        subject: '{{trigger.subject}}',
        body: '<p>Microsoft workflow body</p>',
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
    expect(microsoft.createdMessages).toEqual([
      expect.objectContaining({
        subject,
        toRecipients: [{ emailAddress: { address: RECIPIENTS.to } }],
        ccRecipients: [{ emailAddress: { address: RECIPIENTS.cc } }],
        bccRecipients: [{ emailAddress: { address: RECIPIENTS.bcc } }],
      }),
    ]);
    expect(microsoft.sentMessageIds).toEqual(['microsoft-message-1']);

    const [message] = await findRecordNodesByFilter<{
      id: string;
      isDraft: boolean;
      text: string | null;
    }>('message', 'messages', 'id isDraft text', {
      subject: { eq: subject },
    });

    expect(message).toMatchObject({
      isDraft: false,
      text: 'Microsoft workflow body',
    });
    expect(
      await findRecordNodesByFilter<{
        messageChannelId: string;
        messageExternalId: string;
      }>(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        'messageChannelId messageExternalId',
        { messageId: { eq: message.id } },
      ),
    ).toEqual([
      expect.objectContaining({
        messageChannelId: channel.channelId,
        messageExternalId: 'microsoft-message-1',
      }),
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

  it('creates a Microsoft draft from a DRAFT_EMAIL step without sending or persisting it', async () => {
    const subject = `Microsoft workflow draft ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Microsoft draft email workflow',
      stepType: 'DRAFT_EMAIL',
      input: {
        connectedAccountId: channel.connectedAccountId,
        recipients: {
          to: '{{trigger.to}}',
          cc: '{{trigger.cc}}',
          bcc: '{{trigger.bcc}}',
        },
        subject: '{{trigger.subject}}',
        body: '<p>Microsoft workflow draft body</p>',
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
    expect(microsoft.createdMessages).toEqual([
      expect.objectContaining({
        subject,
        toRecipients: [{ emailAddress: { address: RECIPIENTS.to } }],
        ccRecipients: [{ emailAddress: { address: RECIPIENTS.cc } }],
        bccRecipients: [{ emailAddress: { address: RECIPIENTS.bcc } }],
      }),
    ]);
    expect(microsoft.sentMessageIds).toEqual([]);
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

  it('creates a Microsoft calendar event from a CREATE_CALENDAR_EVENT step', async () => {
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
      iCalUid: expect.stringContaining('@microsoft.com'),
      attendeeCount: 1,
      connectedAccountId: channel.connectedAccountId,
    });
    expect(microsoft.createdCalendarEvents).toEqual([
      expect.objectContaining({
        subject: title,
        location: { displayName: 'Room 101' },
        attendees: [
          { emailAddress: { address: RECIPIENTS.to }, type: 'required' },
        ],
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
      }),
    ]);
    expect(await findImportedCalendarEventTitles([title])).toEqual([title]);
  }, 60000);
});
