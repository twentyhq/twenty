import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IsNull } from 'typeorm';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { runWebhookTriggeredActionStep } from 'test/integration/graphql/suites/workflow/utils/run-webhook-triggered-action-step.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const MAILBOX_HANDLE = 'sender-selection-mailbox@apple.dev';
const RECIPIENT = 'sender-selection-recipient@example.com';
const APP_CONNECTION_ID = '20202020-0000-4000-8000-0000000000b1';

const emailInput = (connectedAccountId: string, subject: string) => ({
  connectedAccountId,
  recipients: { to: RECIPIENT, cc: '', bcc: '' },
  subject,
  body: `<p>${subject}</p>`,
});

describe('Email workflow steps pick the sender production runs rely on (integration)', () => {
  const google = setupGoogleMock({ handle: MAILBOX_HANDLE });

  const connectedAccounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);

  let mailbox: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let preexistingAccountIds: string[] = [];

  beforeAll(async () => {
    const preexistingAccounts = await connectedAccounts().find({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, archivedAt: IsNull() },
      select: { id: true },
    });

    preexistingAccountIds = preexistingAccounts.map(({ id }) => id);

    if (preexistingAccountIds.length > 0) {
      await connectedAccounts().update(preexistingAccountIds, {
        archivedAt: new Date(),
      });
    }

    mailbox = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: MAILBOX_HANDLE,
    });

    await connectedAccounts().update(
      { id: mailbox.connectedAccountId },
      {
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        visibility: 'user',
      },
    );

    await global.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, "userWorkspaceId", "workspaceId", visibility, "createdAt", "updatedAt")
       VALUES ($1, 'sender-selection-app@apple.dev', 'app', $2, $3, 'user', '1970-01-01T00:00:00Z', now())`,
      [
        APP_CONNECTION_ID,
        USER_WORKSPACE_DATA_SEED_IDS.JONY,
        SEED_APPLE_WORKSPACE_ID,
      ],
    );
  }, 120000);

  afterAll(async () => {
    await global.testDataSource
      .query(`DELETE FROM core."connectedAccount" WHERE id = $1`, [
        APP_CONNECTION_ID,
      ])
      .catch(() => undefined);
    await mailbox?.cleanup().catch(() => undefined);

    if (preexistingAccountIds.length > 0) {
      await connectedAccounts().update(preexistingAccountIds, {
        archivedAt: null,
      });
    }
  });

  it('sends from the oldest mailbox, skipping an older connection that cannot send, when the step names none', async () => {
    const subject = `Default sender ${randomUUID()}`;

    const workflowRun = await runWebhookTriggeredActionStep({
      name: 'Default sender send email workflow',
      stepType: 'SEND_EMAIL',
      input: emailInput('', subject),
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: mailbox.connectedAccountId,
    });
  }, 60000);

  it('drafts from the oldest mailbox when the step names none', async () => {
    const subject = `Default sender draft ${randomUUID()}`;

    const workflowRun = await runWebhookTriggeredActionStep({
      name: 'Default sender draft email workflow',
      stepType: 'DRAFT_EMAIL',
      input: emailInput('', subject),
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: mailbox.connectedAccountId,
    });
  }, 60000);

  it("sends from a colleague's mailbox named on the step", async () => {
    const subject = `Pinned sender ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Pinned sender send email workflow',
      stepType: 'SEND_EMAIL',
      input: emailInput(mailbox.connectedAccountId, subject),
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: mailbox.connectedAccountId,
    });
  }, 60000);

  it("sends from a workspace member's own mailbox when the step names that member", async () => {
    const subject = `Member sender ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Member sender send email workflow',
      stepType: 'SEND_EMAIL',
      input: emailInput(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, subject),
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: mailbox.connectedAccountId,
    });
  }, 60000);

  it('sends from the mailbox a workflow variable resolves to', async () => {
    const subject = `Variable sender ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Variable sender send email workflow',
      stepType: 'SEND_EMAIL',
      input: emailInput('{{trigger.senderId}}', subject),
      payload: { senderId: mailbox.connectedAccountId },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: mailbox.connectedAccountId,
    });
  }, 60000);

  it('fails the step without sending when the account named on the step cannot send', async () => {
    const sentMessageCount = google.sentMessages.length;

    const workflowRun = await runWorkflowActionStep({
      name: 'Incapable sender send email workflow',
      stepType: 'SEND_EMAIL',
      input: emailInput(APP_CONNECTION_ID, `Incapable ${randomUUID()}`),
    });

    expect(workflowRun).toMatchObject({
      status: 'FAILED',
      stepStatus: 'FAILED',
      stepError: expect.stringContaining('cannot perform SEND_EMAIL'),
    });
    expect(google.sentMessages).toHaveLength(sentMessageCount);
  }, 60000);

  it('fails the step without sending when the mailbox named on the step is archived', async () => {
    await connectedAccounts().update(
      { id: mailbox.connectedAccountId },
      { archivedAt: new Date() },
    );

    const sentMessageCount = google.sentMessages.length;

    try {
      const workflowRun = await runWorkflowActionStep({
        name: 'Archived sender send email workflow',
        stepType: 'SEND_EMAIL',
        input: emailInput(
          mailbox.connectedAccountId,
          `Archived ${randomUUID()}`,
        ),
      });

      expect(workflowRun).toMatchObject({
        status: 'FAILED',
        stepStatus: 'FAILED',
        stepError: expect.stringContaining('No connected account found'),
      });
      expect(google.sentMessages).toHaveLength(sentMessageCount);
    } finally {
      await connectedAccounts().update(
        { id: mailbox.connectedAccountId },
        { archivedAt: null },
      );
    }
  }, 60000);
});
