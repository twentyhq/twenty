import { gql } from 'graphql-tag';
import {
  activateCoreWorkflowVersion,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const GETTING_STARTED_PROGRESS_QUERY = gql`
  query GettingStartedProgress {
    gettingStartedProgress {
      steps {
        step
        kind
      }
      completedSteps
    }
  }
`;

const UPDATE_GETTING_STARTED_MUTATION = gql`
  mutation UpdateGettingStarted($input: UpdateGettingStartedInput!) {
    updateGettingStarted(input: $input) {
      completedSteps
      selectedStep
      snoozedUntil
      isHidden
    }
  }
`;

const PREPARE_GETTING_STARTED_WORKFLOW_MUTATION = gql`
  mutation PrepareGettingStartedWorkflow($step: GettingStartedStep!) {
    prepareGettingStartedWorkflow(step: $step) {
      workflowId
      versionId
    }
  }
`;

const GETTING_STARTED_WORKFLOW_PREVIEWS_QUERY = gql`
  query GettingStartedWorkflowPreviews {
    gettingStartedWorkflowPreviews {
      step
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

const prepareGettingStartedWorkflow = (step: string) =>
  makeMetadataApiRequest({
    query: PREPARE_GETTING_STARTED_WORKFLOW_MUTATION,
    variables: { step },
  });

const findCompletedSteps = async (): Promise<string[]> => {
  const response = await makeMetadataApiRequest({
    query: GETTING_STARTED_PROGRESS_QUERY,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.gettingStartedProgress.completedSteps;
};

describe('gettingStarted (e2e)', () => {
  beforeAll(deleteGettingStartedUserVars);
  afterAll(deleteGettingStartedUserVars);

  describe('gettingStartedProgress', () => {
    it('lists the steps in order, without the app step on an empty catalog, and completes the connected mailbox step', async () => {
      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();

      const { steps, completedSteps } =
        response.body.data.gettingStartedProgress;

      expect(steps).toEqual([
        { step: 'CONNECT_MAILBOX', kind: 'CUSTOM' },
        { step: 'IMPORT_DATA', kind: 'CUSTOM' },
        { step: 'CUSTOMIZE_DATA_MODEL', kind: 'PROMPT' },
        { step: 'INVITE_TEAM', kind: 'CUSTOM' },
        { step: 'HANDOVER_DEALS', kind: 'WORKFLOW' },
        { step: 'FOLLOW_UP_DEALS', kind: 'PROMPT' },
      ]);
      expect(completedSteps).toContain('CONNECT_MAILBOX');
      expect(
        await findJaneUserVar('GETTING_STARTED_STEP_CONNECT_MAILBOX'),
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
          expect.objectContaining({ step: 'HANDOVER_DEALS' }),
        );
      } finally {
        await globalThis.testDataSource.query(
          `UPDATE core."connectedAccount" SET "archivedAt" = NULL WHERE "id" = ANY($1)`,
          [activeMailboxIds],
        );
      }
    });
  });

  describe('updateGettingStarted', () => {
    it('persists the selected step, the snooze and the hide', async () => {
      const response = await updateGettingStarted({
        selectedStep: 'INVITE_TEAM',
        snoozedUntil: '2099-01-01T00:00:00.000Z',
        isHidden: true,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateGettingStarted).toMatchObject({
        selectedStep: 'INVITE_TEAM',
        snoozedUntil: '2099-01-01T00:00:00.000Z',
        isHidden: true,
      });
    });

    it('completes a step', async () => {
      const response = await updateGettingStarted({
        completedStep: 'INVITE_TEAM',
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateGettingStarted.completedSteps).toContain(
        'INVITE_TEAM',
      );
    });

    it('keeps the first completion when a step is completed twice', async () => {
      await updateGettingStarted({ completedStep: 'FOLLOW_UP_DEALS' });

      const firstCompletion = await findJaneUserVar(
        'GETTING_STARTED_STEP_FOLLOW_UP_DEALS',
      );

      const secondResponse = await updateGettingStarted({
        completedStep: 'FOLLOW_UP_DEALS',
      });

      expect(secondResponse.body.errors).toBeUndefined();
      expect(firstCompletion).toEqual({ completedAt: expect.any(String) });
      expect(
        await findJaneUserVar('GETTING_STARTED_STEP_FOLLOW_UP_DEALS'),
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
          step: 'HANDOVER_DEALS',
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

    it('reuses the draft, then completes the handover step once the workflow is turned on', async () => {
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
      expect(await findCompletedSteps()).not.toContain('HANDOVER_DEALS');

      const emailStep = draftVersion.steps?.find(
        (step) => step.type === 'SEND_EMAIL',
      );

      if (!isDefined(emailStep)) {
        throw new Error('The handover draft has no email step');
      }

      await updateCoreWorkflowVersionStep({
        coreWorkflowVersionId: handover.versionId,
        step: {
          ...emailStep,
          settings: {
            ...emailStep.settings,
            input: {
              ...emailStep.settings.input,
              connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
            },
          },
        },
      });
      await activateCoreWorkflowVersion({
        coreWorkflowVersionId: handover.versionId,
      });

      expect(await findCompletedSteps()).toContain('HANDOVER_DEALS');
      expect(
        await findJaneUserVar('GETTING_STARTED_STEP_HANDOVER_DEALS'),
      ).toEqual({ completedAt: expect.any(String) });
    });
  });
});
