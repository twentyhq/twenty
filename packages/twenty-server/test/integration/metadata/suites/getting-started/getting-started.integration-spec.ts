import { gql } from 'graphql-tag';
import {
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppInjectablesByClassName } from 'test/integration/utils/get-app-injectables-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

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

const updateGettingStarted = (input: Record<string, unknown>) =>
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

const deleteCompanyEnrichmentAttempt = () =>
  globalThis.testDataSource.query(
    `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "userId" IS NULL AND "key" = 'COMPANY_ENRICHMENT_ATTEMPT'`,
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
  });

  describe('assigned step action keys', () => {
    beforeEach(deleteCompanyEnrichmentAttempt);

    afterEach(async () => {
      await deleteGettingStartedUserVars();
      await deleteCompanyEnrichmentAttempt();
    });

    it('saves the assigned list once the company enrichment is final', async () => {
      await insertKeyValuePair({
        userId: null,
        key: 'COMPANY_ENRICHMENT_ATTEMPT',
        value: {
          domain: 'apple.dev',
          outcome: 'notFound',
          attemptedAt: '2026-10-30T00:00:00.000Z',
        },
        type: 'CONFIG_VARIABLE',
      });

      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();
      expect(await findJaneUserVar('GETTING_STARTED_STEP_ACTION_KEYS')).toEqual(
        [
          'CONNECT_MAILBOX',
          'IMPORT_DATA',
          'CUSTOMIZE_DATA_MODEL',
          'INVITE_TEAM',
          'HANDOVER_DEALS',
          'FOLLOW_UP_DEALS',
          'INSTALL_APP',
        ],
      );
    });

    it('does not save the list after a transient enrichment error', async () => {
      await insertKeyValuePair({
        userId: null,
        key: 'COMPANY_ENRICHMENT_ATTEMPT',
        value: {
          domain: 'apple.dev',
          outcome: 'transientError',
          httpStatus: 503,
          message: 'Service unavailable',
          attemptedAt: '2026-10-30T00:00:00.000Z',
        },
        type: 'CONFIG_VARIABLE',
      });

      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();
      expect(
        await findJaneUserVar('GETTING_STARTED_STEP_ACTION_KEYS'),
      ).toBeUndefined();
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
        selectedStepActionKey: 'INVITE_TEAM',
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
        completedStepActionKey: 'INVITE_TEAM',
      });

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.updateGettingStarted.completedStepActionKeys,
      ).toContain('INVITE_TEAM');
    });

    it('keeps the first completion when a step is completed twice', async () => {
      await updateGettingStarted({ completedStepActionKey: 'FOLLOW_UP_DEALS' });

      const firstCompletion = await findJaneUserVar(
        'GETTING_STARTED_COMPLETED_FOLLOW_UP_DEALS',
      );

      const secondResponse = await updateGettingStarted({
        completedStepActionKey: 'FOLLOW_UP_DEALS',
      });

      expect(secondResponse.body.errors).toBeUndefined();
      expect(firstCompletion).toEqual({ completedAt: expect.any(String) });
      expect(
        await findJaneUserVar('GETTING_STARTED_COMPLETED_FOLLOW_UP_DEALS'),
      ).toEqual(firstCompletion);
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
  });
});
