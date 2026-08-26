import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { setTestConnectedAccountHandleAliases } from 'test/integration/utils/set-test-connected-account-handle-aliases.util';

const HANDLE = 'microsoft-draft-email-action@apple.dev';
const ALIAS = 'microsoft-draft-email-action-alias@apple.dev';
const RECIPIENTS = {
  to: 'to-recipient@example.com',
  cc: 'cc-recipient@example.com',
  bcc: 'bcc-recipient@example.com',
};

describe('DRAFT_EMAIL workflow action on Microsoft (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
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

  it('drafts from a verified alias configured on the step', async () => {
    const subject = `Microsoft workflow alias draft ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Microsoft alias draft email workflow',
      stepType: 'DRAFT_EMAIL',
      input: {
        connectedAccountId: channel.connectedAccountId,
        fromHandle: ALIAS,
        recipients: { to: RECIPIENTS.to, cc: '', bcc: '' },
        subject,
        body: '<p>Microsoft workflow alias draft body</p>',
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    const [lastCreatedMessage] = microsoft.createdMessages.slice(-1);

    expect(lastCreatedMessage).toMatchObject({
      subject,
      from: { emailAddress: { address: ALIAS } },
    });
    expect(microsoft.sentMessageIds).toEqual([]);
  }, 60000);
});
