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

const MISSING_SCOPE_HANDLE = 'calendar-missing-scope-account@apple.dev';
const CALENDAR_HANDLE = 'calendar-scoped-account@apple.dev';

const EVENT_INPUT = {
  startsAt: '2026-08-13T09:00:00Z',
  endsAt: '2026-08-13T10:00:00Z',
  isFullDay: false,
  timeZone: 'UTC',
  attendees: '',
  sendInvitations: false,
  addConferencing: false,
};

describe('Calendar workflow steps pick the account production runs rely on (integration)', () => {
  const google = setupGoogleMock({ handle: MISSING_SCOPE_HANDLE });

  const connectedAccounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);

  let missingScopeAccount: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let calendarAccount: Awaited<ReturnType<typeof connectMessagingAccount>>;
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

    missingScopeAccount = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: MISSING_SCOPE_HANDLE,
    });

    google.actAsAccount(CALENDAR_HANDLE);

    calendarAccount = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: CALENDAR_HANDLE,
    });

    await connectedAccounts().update(
      { id: missingScopeAccount.connectedAccountId },
      {
        scopes: ['email', 'profile'],
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        visibility: 'user',
      },
    );
    await connectedAccounts().update(
      { id: calendarAccount.connectedAccountId },
      {
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
        visibility: 'user',
      },
    );
  }, 120000);

  afterAll(async () => {
    await calendarAccount?.cleanup().catch(() => undefined);
    await missingScopeAccount?.cleanup().catch(() => undefined);

    if (preexistingAccountIds.length > 0) {
      await connectedAccounts().update(preexistingAccountIds, {
        archivedAt: null,
      });
    }
  });

  it('skips an older account missing the calendar permission when the step names none', async () => {
    const title = `Default calendar account ${randomUUID()}`;

    const workflowRun = await runWebhookTriggeredActionStep({
      name: 'Default calendar account workflow',
      stepType: 'CREATE_CALENDAR_EVENT',
      input: { ...EVENT_INPUT, connectedAccountId: '', title },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      title,
      connectedAccountId: calendarAccount.connectedAccountId,
    });
  }, 60000);

  it("creates from a colleague's account named on the step", async () => {
    const title = `Pinned calendar account ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'Pinned calendar account workflow',
      stepType: 'CREATE_CALENDAR_EVENT',
      input: {
        ...EVENT_INPUT,
        connectedAccountId: calendarAccount.connectedAccountId,
        title,
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      title,
      connectedAccountId: calendarAccount.connectedAccountId,
    });
  }, 60000);

  it('asks to reconnect an account named on the step that lacks the calendar permission', async () => {
    const createdEventCount = google.createdCalendarEvents.length;

    const workflowRun = await runWorkflowActionStep({
      name: 'Missing scope calendar account workflow',
      stepType: 'CREATE_CALENDAR_EVENT',
      input: {
        ...EVENT_INPUT,
        connectedAccountId: missingScopeAccount.connectedAccountId,
        title: `Missing scope ${randomUUID()}`,
      },
    });

    expect(workflowRun).toMatchObject({
      status: 'FAILED',
      stepStatus: 'FAILED',
      stepError: expect.stringContaining('missing permissions'),
    });
    expect(google.createdCalendarEvents).toHaveLength(createdEventCount);
  }, 60000);
});
