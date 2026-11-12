import { gql } from 'graphql-tag';
import {
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppInjectablesByClassName } from 'test/integration/utils/get-app-injectables-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const GETTING_STARTED_PROGRESS_QUERY = gql`
  query GettingStartedProgress {
    gettingStartedProgress {
      steps {
        actionKey
        kind
      }
      completedStepActionKeys
    }
  }
`;

const UPDATE_GETTING_STARTED_MUTATION = gql`
  mutation UpdateGettingStarted($input: UpdateGettingStartedInput!) {
    updateGettingStarted(input: $input) {
      steps {
        actionKey
        doneChatThreadId
        doneWorkflowId
      }
      completedStepActionKeys
      selectedStepActionKey
      snoozedUntil
      isHidden
    }
  }
`;

const PREPARE_GETTING_STARTED_WORKFLOW_MUTATION = gql`
  mutation PrepareGettingStartedWorkflow(
    $stepActionKey: GettingStartedStepActionKey!
  ) {
    prepareGettingStartedWorkflow(stepActionKey: $stepActionKey) {
      workflowId
      versionId
    }
  }
`;

const GETTING_STARTED_WORKFLOW_PREVIEWS_QUERY = gql`
  query GettingStartedWorkflowPreviews {
    gettingStartedWorkflowPreviews {
      stepActionKey
      trigger {
        type
        databaseEventAction
        title
      }
      actions {
        type
        title
      }
    }
  }
`;

const deleteGettingStartedUserVars = () =>
  globalThis.testDataSource.query(
    `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND ("userId" = $2 OR "userId" IS NULL) AND "key" LIKE 'GETTING_STARTED_%'`,
    [SEED_APPLE_WORKSPACE_ID, USER_DATA_SEED_IDS.JANE],
  );

const findWorkspaceUserVar = async (key: string) => {
  const [keyValuePair] = await globalThis.testDataSource.query(
    `SELECT "value" FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "userId" IS NULL AND "key" = $2`,
    [SEED_APPLE_WORKSPACE_ID, key],
  );

  return keyValuePair?.value;
};

const findJaneUserVar = async (key: string) => {
  const [keyValuePair] = await globalThis.testDataSource.query(
    `SELECT "value" FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "userId" = $2 AND "key" = $3`,
    [SEED_APPLE_WORKSPACE_ID, USER_DATA_SEED_IDS.JANE, key],
  );

  return keyValuePair?.value;
};

const updateGettingStarted = (input: UpdateGettingStartedInput) =>
  makeMetadataApiRequest({
    query: UPDATE_GETTING_STARTED_MUTATION,
    variables: { input },
  });

const insertKeyValuePair = ({
  userId,
  key,
  value,
  type,
}: {
  userId: string | null;
  key: string;
  value: unknown;
  type: 'USER_VARIABLE' | 'CONFIG_VARIABLE';
}) =>
  globalThis.testDataSource.query(
    `INSERT INTO core."keyValuePair" ("workspaceId", "userId", "key", "value", "type") VALUES ($1, $2, $3, $4, $5)`,
    [SEED_APPLE_WORKSPACE_ID, userId, key, JSON.stringify(value), type],
  );

const deleteCompanyEnrichment = () =>
  globalThis.testDataSource.query(
    `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "userId" IS NULL AND "key" = 'COMPANY_ENRICHMENT'`,
    [SEED_APPLE_WORKSPACE_ID],
  );

const prepareGettingStartedWorkflow = (stepActionKey: string) =>
  makeMetadataApiRequest({
    query: PREPARE_GETTING_STARTED_WORKFLOW_MUTATION,
    variables: { stepActionKey },
  });

const findCompletedStepActionKeys = async (): Promise<string[]> => {
  const response = await makeMetadataApiRequest({
    query: GETTING_STARTED_PROGRESS_QUERY,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.gettingStartedProgress.completedStepActionKeys;
};

describe('gettingStarted (e2e)', () => {
  let billingEnabledGuardSpies: jest.SpyInstance[] = [];

  const setIsBillingEnabled = (isBillingEnabled: boolean) =>
    billingEnabledGuardSpies.forEach((spy) =>
      spy.mockReturnValue(isBillingEnabled),
    );

  beforeAll(async () => {
    billingEnabledGuardSpies = getAppInjectablesByClassName<{
      canActivate: () => boolean;
    }>('BillingEnabledGuard').map((billingEnabledGuard) =>
      jest.spyOn(billingEnabledGuard, 'canActivate'),
    );
    setIsBillingEnabled(true);
    await deleteGettingStartedUserVars();
  });

  afterAll(async () => {
    billingEnabledGuardSpies.forEach((spy) => spy.mockRestore());
    await deleteGettingStartedUserVars();
  });

  it('refuses every getting started request when billing is disabled', async () => {
    setIsBillingEnabled(false);

    try {
      const responses = await Promise.all([
        makeMetadataApiRequest({ query: GETTING_STARTED_PROGRESS_QUERY }),
        makeMetadataApiRequest({
          query: GETTING_STARTED_WORKFLOW_PREVIEWS_QUERY,
        }),
      ]);

      responses.forEach((response) =>
        expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN'),
      );
    } finally {
      setIsBillingEnabled(true);
    }
  });

  describe('gettingStartedProgress', () => {
    it('lists the steps in order, without the app step on an empty catalog, and completes the connected mailbox step', async () => {
      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();

      const { steps, completedStepActionKeys } =
        response.body.data.gettingStartedProgress;

      expect(steps).toEqual([
        { actionKey: 'CONNECT_MAILBOX', kind: 'CUSTOM' },
        { actionKey: 'IMPORT_DATA', kind: 'CUSTOM' },
        { actionKey: 'CUSTOMIZE_DATA_MODEL', kind: 'PROMPT' },
        { actionKey: 'INVITE_TEAM', kind: 'CUSTOM' },
        { actionKey: 'HANDOVER_DEALS', kind: 'WORKFLOW' },
        { actionKey: 'FOLLOW_UP_DEALS', kind: 'PROMPT' },
      ]);
      expect(completedStepActionKeys).toContain('CONNECT_MAILBOX');
      expect(
        await findJaneUserVar('GETTING_STARTED_COMPLETED_CONNECT_MAILBOX'),
      ).toEqual({ completedAt: expect.any(String) });
    });

    it('leaves out the handover step without a mailbox that can send', async () => {
      const activeMailboxes: { id: string }[] =
        await globalThis.testDataSource.query(
          `SELECT "id" FROM core."connectedAccount" WHERE "userWorkspaceId" = $1 AND "archivedAt" IS NULL`,
          [USER_WORKSPACE_DATA_SEED_IDS.JANE],
        );
      const activeMailboxIds = activeMailboxes.map(({ id }) => id);

      await globalThis.testDataSource.query(
        `UPDATE core."connectedAccount" SET "archivedAt" = NOW() WHERE "id" = ANY($1)`,
        [activeMailboxIds],
      );

      try {
        const response = await makeMetadataApiRequest({
          query: GETTING_STARTED_PROGRESS_QUERY,
        });

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.gettingStartedProgress.steps,
        ).not.toContainEqual(
          expect.objectContaining({ actionKey: 'HANDOVER_DEALS' }),
        );
      } finally {
        await globalThis.testDataSource.query(
          `UPDATE core."connectedAccount" SET "archivedAt" = NULL WHERE "id" = ANY($1)`,
          [activeMailboxIds],
        );
      }
    });

    it('leaves the mailbox step open when the only account comes from an SSO sign-in', async () => {
      const activeAccounts: { id: string }[] =
        await globalThis.testDataSource.query(
          `SELECT "id" FROM core."connectedAccount" WHERE "userWorkspaceId" = $1 AND "archivedAt" IS NULL`,
          [USER_WORKSPACE_DATA_SEED_IDS.JANE],
        );
      const activeAccountIds = activeAccounts.map(({ id }) => id);

      await globalThis.testDataSource.query(
        `UPDATE core."connectedAccount" SET "archivedAt" = NOW() WHERE "id" = ANY($1)`,
        [activeAccountIds],
      );

      const [ssoAccount]: { id: string }[] =
        await globalThis.testDataSource.query(
          `INSERT INTO core."connectedAccount" ("workspaceId", "userWorkspaceId", "handle", "provider", "scopes", "lastSignedInAt") VALUES ($1, $2, 'jane.sso@apple.dev', 'google', $3, NOW()) RETURNING "id"`,
          [
            SEED_APPLE_WORKSPACE_ID,
            USER_WORKSPACE_DATA_SEED_IDS.JANE,
            ['email', 'profile'],
          ],
        );

      await globalThis.testDataSource.query(
        `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "userId" = $2 AND "key" = 'GETTING_STARTED_COMPLETED_CONNECT_MAILBOX'`,
        [SEED_APPLE_WORKSPACE_ID, USER_DATA_SEED_IDS.JANE],
      );

      try {
        expect(await findCompletedStepActionKeys()).not.toContain(
          'CONNECT_MAILBOX',
        );
      } finally {
        await globalThis.testDataSource.query(
          `DELETE FROM core."connectedAccount" WHERE "id" = $1`,
          [ssoAccount.id],
        );
        await globalThis.testDataSource.query(
          `UPDATE core."connectedAccount" SET "archivedAt" = NULL WHERE "id" = ANY($1)`,
          [activeAccountIds],
        );
      }
    });
  });

  describe('assigned step action keys', () => {
    beforeEach(async () => {
      await deleteGettingStartedUserVars();
      await deleteCompanyEnrichment();
    });

    afterEach(async () => {
      await deleteGettingStartedUserVars();
      await deleteCompanyEnrichment();
    });

    it('saves the assigned list on the first read and keeps it when the company enrichment lands later', async () => {
      const teamStepActionKeys = [
        'CONNECT_MAILBOX',
        'BOOK_CALL',
        'IMPORT_DATA',
        'CUSTOMIZE_DATA_MODEL',
        'INVITE_TEAM',
        'HANDOVER_DEALS',
        'FOLLOW_UP_DEALS',
        'INSTALL_APP',
      ];

      const firstResponse = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(firstResponse.body.errors).toBeUndefined();
      expect(await findJaneUserVar('GETTING_STARTED_STEP_ACTION_KEYS')).toEqual(
        teamStepActionKeys,
      );

      await insertKeyValuePair({
        userId: null,
        key: 'COMPANY_ENRICHMENT',
        value: {
          domain: 'apple.dev',
          enrichedAt: '2026-10-30T00:00:00.000Z',
          name: 'Apple',
          website: 'apple.dev',
          industry: null,
          employeeCount: 5,
          size: '1-10',
          founded: null,
          headline: null,
          summary: null,
          tags: [],
          locality: null,
          region: null,
          country: null,
        },
        type: 'CONFIG_VARIABLE',
      });

      const secondResponse = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(secondResponse.body.errors).toBeUndefined();
      expect(await findJaneUserVar('GETTING_STARTED_STEP_ACTION_KEYS')).toEqual(
        teamStepActionKeys,
      );
      expect(secondResponse.body.data.gettingStartedProgress.steps).toEqual(
        firstResponse.body.data.gettingStartedProgress.steps,
      );
    });

    it('keeps the saved list in its order and drops unknown keys', async () => {
      await insertKeyValuePair({
        userId: USER_DATA_SEED_IDS.JANE,
        key: 'GETTING_STARTED_STEP_ACTION_KEYS',
        value: ['FOLLOW_UP_DEALS', 'REMOVED_STEP', 'IMPORT_DATA'],
        type: 'USER_VARIABLE',
      });

      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.gettingStartedProgress.steps).toEqual([
        { actionKey: 'FOLLOW_UP_DEALS', kind: 'PROMPT' },
        { actionKey: 'IMPORT_DATA', kind: 'CUSTOM' },
      ]);
    });
  });

  describe('updateGettingStarted', () => {
    it('persists the selected step, the snooze and the hide', async () => {
      const response = await updateGettingStarted({
        selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
        snoozedUntil: '2099-01-01T00:00:00.000Z',
        isHidden: true,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateGettingStarted).toMatchObject({
        selectedStepActionKey: 'INVITE_TEAM',
        snoozedUntil: '2099-01-01T00:00:00.000Z',
        isHidden: true,
      });
    });

    it('completes a step', async () => {
      const response = await updateGettingStarted({
        completedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      });

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.updateGettingStarted.completedStepActionKeys,
      ).toContain('INVITE_TEAM');
    });

    it('keeps the first completion when a step is completed twice', async () => {
      await updateGettingStarted({
        completedStepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
      });

      const firstCompletion = await findJaneUserVar(
        'GETTING_STARTED_COMPLETED_FOLLOW_UP_DEALS',
      );

      const secondResponse = await updateGettingStarted({
        completedStepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
      });

      expect(secondResponse.body.errors).toBeUndefined();
      expect(firstCompletion).toEqual({ completedAt: expect.any(String) });
      expect(
        await findJaneUserVar('GETTING_STARTED_COMPLETED_FOLLOW_UP_DEALS'),
      ).toEqual(firstCompletion);
    });

    it('returns the chat thread a step was completed with on that step only', async () => {
      const chatThreadId = '20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90';

      const response = await updateGettingStarted({
        completedStepActionKey:
          GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
        completedStepChatThreadId: chatThreadId,
      });

      expect(response.body.errors).toBeUndefined();
      expect(
        await findJaneUserVar('GETTING_STARTED_COMPLETED_CUSTOMIZE_DATA_MODEL'),
      ).toEqual({ completedAt: expect.any(String), chatThreadId });
      expect(response.body.data.updateGettingStarted.steps).toContainEqual({
        actionKey: 'CUSTOMIZE_DATA_MODEL',
        doneChatThreadId: chatThreadId,
        doneWorkflowId: null,
      });
      expect(response.body.data.updateGettingStarted.steps).toContainEqual({
        actionKey: 'INVITE_TEAM',
        doneChatThreadId: null,
        doneWorkflowId: null,
      });
    });

    it('refuses a chat thread id that is not a UUID', async () => {
      const response = await updateGettingStarted({
        completedStepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        completedStepChatThreadId: 'not-a-uuid',
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    });
  });

  describe('gettingStartedWorkflowPreviews', () => {
    it('lists the handover trigger and its visible steps', async () => {
      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_WORKFLOW_PREVIEWS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.gettingStartedWorkflowPreviews).toEqual([
        {
          stepActionKey: 'HANDOVER_DEALS',
          trigger: {
            type: 'DATABASE_EVENT',
            databaseEventAction: 'updated',
            title: 'A deal is won',
          },
          actions: [
            { type: 'CREATE_RECORD', title: 'Create a kickoff task' },
            { type: 'SEND_EMAIL', title: 'Email the account owner' },
          ],
        },
      ]);
    });
  });

  describe('prepareGettingStartedWorkflow', () => {
    let handoverWorkflowId: string | undefined;

    afterAll(async () => {
      if (isDefined(handoverWorkflowId)) {
        await deleteCoreWorkflows({ coreWorkflowIds: [handoverWorkflowId] });
      }
    });

    it('refuses a step that has no workflow', async () => {
      const response = await prepareGettingStartedWorkflow('FOLLOW_UP_DEALS');

      expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
        'INVALID_STEP',
      );
      expect(
        await findWorkspaceUserVar('GETTING_STARTED_WORKFLOW_FOLLOW_UP_DEALS'),
      ).toBeUndefined();
    });

    it('reuses the draft and leaves it off', async () => {
      const firstResponse =
        await prepareGettingStartedWorkflow('HANDOVER_DEALS');

      expect(firstResponse.body.errors).toBeUndefined();

      const handover = firstResponse.body.data.prepareGettingStartedWorkflow;

      handoverWorkflowId = handover.workflowId;

      expect(
        await findWorkspaceUserVar('GETTING_STARTED_WORKFLOW_HANDOVER_DEALS'),
      ).toEqual(handover);

      const secondResponse =
        await prepareGettingStartedWorkflow('HANDOVER_DEALS');

      expect(secondResponse.body.data.prepareGettingStartedWorkflow).toEqual(
        handover,
      );

      const draftVersion = await findCoreWorkflowVersion({
        coreWorkflowVersionId: handover.versionId,
      });

      expect(draftVersion.status).toBe('DRAFT');
      expect(await findCompletedStepActionKeys()).not.toContain(
        'HANDOVER_DEALS',
      );
    });

    it('returns the prepared workflow on the step once it is completed', async () => {
      const prepareResponse =
        await prepareGettingStartedWorkflow('HANDOVER_DEALS');

      handoverWorkflowId =
        prepareResponse.body.data.prepareGettingStartedWorkflow.workflowId;

      const response = await updateGettingStarted({
        completedStepActionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateGettingStarted.steps).toContainEqual({
        actionKey: 'HANDOVER_DEALS',
        doneChatThreadId: null,
        doneWorkflowId: handoverWorkflowId,
      });
    });
  });
});
