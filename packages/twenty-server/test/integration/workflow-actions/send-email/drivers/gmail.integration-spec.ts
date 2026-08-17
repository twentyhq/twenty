import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';

const HANDLE = 'gmail-send-email-action@apple.dev';
const RECIPIENTS = {
  to: 'to-recipient@example.com',
  cc: 'cc-recipient@example.com',
  bcc: 'bcc-recipient@example.com',
};

describe('SEND_EMAIL workflow action on Gmail (integration)', () => {
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

  it('sends an email with recipients resolved from the trigger payload', async () => {
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
});
