import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IsNull } from 'typeorm';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const CALLER_HANDLE = 'caller-connected-account@apple.dev';
const RECIPIENT = 'caller-connected-account-recipient@example.com';

describe('Email workflow actions without a configured sender (integration)', () => {
  const google = setupGoogleMock({ handle: CALLER_HANDLE });

  const connectedAccountRepository = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);

  let callerAccount: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let seededCallerAccountIds: string[] = [];

  beforeAll(async () => {
    const seededCallerAccounts = await connectedAccountRepository().find({
      where: {
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        archivedAt: IsNull(),
      },
      select: { id: true },
    });

    seededCallerAccountIds = seededCallerAccounts.map(({ id }) => id);

    if (seededCallerAccountIds.length > 0) {
      await connectedAccountRepository().update(seededCallerAccountIds, {
        archivedAt: new Date(),
      });
    }

    callerAccount = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: CALLER_HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await callerAccount?.cleanup().catch(() => undefined);

    if (seededCallerAccountIds.length > 0) {
      await connectedAccountRepository().update(seededCallerAccountIds, {
        archivedAt: null,
      });
    }
  });

  it('sends a SEND_EMAIL step from the run caller own account', async () => {
    const sentMessageCount = google.sentMessages.length;
    const subject = `Caller connected account send ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Caller connected account send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId: '',
        recipients: { to: RECIPIENT, cc: '', bcc: '' },
        subject,
        body: '<p>Caller connected account send body</p>',
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
    expect(google.sentMessages).toHaveLength(sentMessageCount + 1);
  }, 60000);

  it('drafts a DRAFT_EMAIL step from the run caller own account', async () => {
    const draftMessageCount = google.draftMessages.length;
    const subject = `Caller connected account draft ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Caller connected account draft email workflow',
      stepType: 'DRAFT_EMAIL',
      input: {
        connectedAccountId: '',
        recipients: { to: RECIPIENT, cc: '', bcc: '' },
        subject,
        body: '<p>Caller connected account draft body</p>',
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
    expect(google.draftMessages).toHaveLength(draftMessageCount + 1);
  }, 60000);
});
