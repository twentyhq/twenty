import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IsNull } from 'typeorm';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { runWebhookTriggeredActionStep } from 'test/integration/graphql/suites/workflow/utils/run-webhook-triggered-action-step.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  ConnectedAccountEntity,
  type ConnectedAccountVisibility,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const OLDEST_HANDLE = 'workspace-oldest-account@apple.dev';
const CALLER_HANDLE = 'run-caller-account@apple.dev';
const RECIPIENT = 'sender-fallback-recipient@example.com';

const CALLER_USER_WORKSPACE_ID = USER_WORKSPACE_DATA_SEED_IDS.JANE;
const OTHER_MEMBER_USER_WORKSPACE_ID = USER_WORKSPACE_DATA_SEED_IDS.JONY;
const THIRD_MEMBER_USER_WORKSPACE_ID = USER_WORKSPACE_DATA_SEED_IDS.PHIL;

describe('Email workflow actions with no sender configured (integration)', () => {
  const google = setupGoogleMock({ handle: OLDEST_HANDLE });

  const connectedAccounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);

  const setAccountOwnership = async ({
    connectedAccountId,
    userWorkspaceId,
    visibility,
  }: {
    connectedAccountId: string;
    userWorkspaceId: string;
    visibility: ConnectedAccountVisibility;
  }) =>
    connectedAccounts().update(
      { id: connectedAccountId },
      { userWorkspaceId, visibility },
    );

  let oldestAccount: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let callerAccount: Awaited<ReturnType<typeof connectMessagingAccount>>;
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

    oldestAccount = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: OLDEST_HANDLE,
    });

    google.actAsAccount(CALLER_HANDLE);

    callerAccount = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: CALLER_HANDLE,
    });
  }, 120000);

  beforeEach(async () => {
    await setAccountOwnership({
      connectedAccountId: oldestAccount.connectedAccountId,
      userWorkspaceId: OTHER_MEMBER_USER_WORKSPACE_ID,
      visibility: 'user',
    });
    await setAccountOwnership({
      connectedAccountId: callerAccount.connectedAccountId,
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
      visibility: 'user',
    });
  });

  afterAll(async () => {
    await setAccountOwnership({
      connectedAccountId: oldestAccount.connectedAccountId,
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
      visibility: 'user',
    }).catch(() => undefined);

    await callerAccount?.cleanup().catch(() => undefined);
    await oldestAccount?.cleanup().catch(() => undefined);

    if (preexistingAccountIds.length > 0) {
      await connectedAccounts().update(preexistingAccountIds, {
        archivedAt: null,
      });
    }
  });

  it('sends from the run caller own account rather than the oldest account of the workspace', async () => {
    const subject = `Caller scoped send ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Caller scoped send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId: '',
        recipients: { to: RECIPIENT, cc: '', bcc: '' },
        subject,
        body: '<p>Caller scoped send body</p>',
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: callerAccount.connectedAccountId,
    });
  }, 60000);

  it('drafts from the run caller own account rather than the oldest account of the workspace', async () => {
    const subject = `Caller scoped draft ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Caller scoped draft email workflow',
      stepType: 'DRAFT_EMAIL',
      input: {
        connectedAccountId: '',
        recipients: { to: RECIPIENT, cc: '', bcc: '' },
        subject,
        body: '<p>Caller scoped draft body</p>',
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: callerAccount.connectedAccountId,
    });
  }, 60000);

  it('keeps the account pinned on the step even when another member owns it', async () => {
    const subject = `Pinned sender send ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Pinned sender send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId: oldestAccount.connectedAccountId,
        recipients: { to: RECIPIENT, cc: '', bcc: '' },
        subject,
        body: '<p>Pinned sender send body</p>',
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: oldestAccount.connectedAccountId,
    });
  }, 60000);

  it('falls back to a workspace visible account when the run caller owns none', async () => {
    await setAccountOwnership({
      connectedAccountId: callerAccount.connectedAccountId,
      userWorkspaceId: THIRD_MEMBER_USER_WORKSPACE_ID,
      visibility: 'user',
    });
    await setAccountOwnership({
      connectedAccountId: oldestAccount.connectedAccountId,
      userWorkspaceId: OTHER_MEMBER_USER_WORKSPACE_ID,
      visibility: 'workspace',
    });

    const subject = `Workspace visible fallback ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Workspace visible fallback send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId: '',
        recipients: { to: RECIPIENT, cc: '', bcc: '' },
        subject,
        body: '<p>Workspace visible fallback body</p>',
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: oldestAccount.connectedAccountId,
    });
  }, 60000);

  it('fails the step rather than sending from a private account of another member', async () => {
    await setAccountOwnership({
      connectedAccountId: callerAccount.connectedAccountId,
      userWorkspaceId: THIRD_MEMBER_USER_WORKSPACE_ID,
      visibility: 'user',
    });

    const sentMessageCount = google.sentMessages.length;

    const workflowRun = await runWorkflowActionStep({
      name: 'No usable account send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId: '',
        recipients: { to: RECIPIENT, cc: '', bcc: '' },
        subject: `No usable account ${randomUUID()}`,
        body: '<p>No usable account body</p>',
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'FAILED',
      stepStatus: 'FAILED',
      stepError: expect.stringContaining(
        `No connected account available for user workspace '${CALLER_USER_WORKSPACE_ID}'`,
      ),
    });
    expect(google.sentMessages).toHaveLength(sentMessageCount);
  }, 60000);

  it('keeps the workspace wide fallback for runs that no user started', async () => {
    const subject = `Webhook triggered send ${randomUUID()}`;

    const workflowRun = await runWebhookTriggeredActionStep({
      name: 'Webhook triggered send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId: '',
        recipients: { to: RECIPIENT, cc: '', bcc: '' },
        subject,
        body: '<p>Webhook triggered send body</p>',
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      subject,
      connectedAccountId: oldestAccount.connectedAccountId,
    });
  }, 60000);
});
