import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { setTestConnectedAccountHandleAliases } from 'test/integration/utils/set-test-connected-account-handle-aliases.util';

const HANDLE = 'gmail-draft-email-action@apple.dev';
const ALIAS = 'gmail-draft-email-action-alias@apple.dev';
const RECIPIENTS = {
  to: 'to-recipient@example.com',
  cc: 'cc-recipient@example.com',
  bcc: 'bcc-recipient@example.com',
};

describe('DRAFT_EMAIL workflow action on Gmail (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
    await setTestConnectedAccountHandleAliases({
      connectedAccountId: channel.connectedAccountId,
      handleAliases: [ALIAS],
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('creates a draft without sending or persisting it', async () => {
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

  it('drafts from a verified alias configured on the step', async () => {
    const subject = `Gmail workflow alias draft ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Gmail alias draft email workflow',
      stepType: 'DRAFT_EMAIL',
      input: {
        connectedAccountId: channel.connectedAccountId,
        fromHandle: ALIAS,
        recipients: { to: RECIPIENTS.to, cc: '', bcc: '' },
        subject,
        body: '<p>Gmail workflow alias draft body</p>',
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });

    const [{ raw }] = google.draftMessages.slice(-1);

    expect(raw).toContain(`<${ALIAS}>`);
    expect(google.sentMessages).toEqual([]);
  }, 60000);
});
