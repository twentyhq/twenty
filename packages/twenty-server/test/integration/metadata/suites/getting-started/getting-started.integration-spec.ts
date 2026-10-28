import { gql } from 'graphql-tag';
import {
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const GETTING_STARTED_PROGRESS_QUERY = gql`
  query GettingStartedProgress {
    gettingStartedProgress {
      creditsEarned
      steps {
        key
        kind
        permissionFlag
      }
      completedSteps
      selectedStep
      snoozedUntil
    }
  }
`;

const UPDATE_GETTING_STARTED_MUTATION = gql`
  mutation UpdateGettingStarted($input: UpdateGettingStartedInput!) {
    updateGettingStarted(input: $input) {
      selectedStep
      snoozedUntil
      isHidden
    }
  }
`;

const UPDATE_GETTING_STARTED_STEP_STATUS_MUTATION = gql`
  mutation UpdateGettingStartedStepStatus($input: UpdateGettingStartedInput!) {
    updateGettingStarted(input: $input) {
      completedSteps
    }
  }
`;

const PREPARE_GETTING_STARTED_WORKFLOW_MUTATION = gql`
  mutation PrepareGettingStartedWorkflow(
    $step: GettingStartedStep!
    $activate: Boolean!
  ) {
    prepareGettingStartedWorkflow(step: $step, activate: $activate) {
      workflowId
      versionId
    }
  }
`;

const deleteGettingStartedUserVars = () =>
  globalThis.testDataSource.query(
    `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND ("userId" = $2 OR "userId" IS NULL) AND "key" LIKE 'GETTING_STARTED_%'`,
    [SEED_APPLE_WORKSPACE_ID, USER_DATA_SEED_IDS.JANE],
  );

const findJaneUserVar = async (key: string) => {
  const [keyValuePair] = await globalThis.testDataSource.query(
    `SELECT "value" FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "userId" = $2 AND "key" = $3`,
    [SEED_APPLE_WORKSPACE_ID, USER_DATA_SEED_IDS.JANE, key],
  );

  return keyValuePair?.value;
};

const fetchStepKeys = async () => {
  const response = await makeMetadataApiRequest({
    query: GETTING_STARTED_PROGRESS_QUERY,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.gettingStartedProgress.steps.map(
    ({ key }: { key: string }) => key,
  );
};

const updateStepStatus = (input: Record<string, unknown>) =>
  makeMetadataApiRequest({
    query: UPDATE_GETTING_STARTED_STEP_STATUS_MUTATION,
    variables: { input: { stepStatus: input } },
  });

describe('gettingStarted (e2e)', () => {
  beforeAll(deleteGettingStartedUserVars);
  afterAll(deleteGettingStartedUserVars);

  describe('gettingStartedProgress', () => {
    it('stores the steps chosen on the first read and keeps them once a mailbox is connected', async () => {
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

      let firstReadStepKeys: string[];

      try {
        firstReadStepKeys = await fetchStepKeys();
      } finally {
        await globalThis.testDataSource.query(
          `UPDATE core."connectedAccount" SET "archivedAt" = NULL WHERE "id" = ANY($1)`,
          [activeMailboxIds],
        );
      }

      expect(firstReadStepKeys).toContain('CONNECT_MAILBOX');
      expect(await findJaneUserVar('GETTING_STARTED_STEPS')).toMatchObject({
        track: 'DEFAULT',
        steps: firstReadStepKeys,
      });

      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });
      const { steps, completedSteps } =
        response.body.data.gettingStartedProgress;

      expect(steps.map(({ key }: { key: string }) => key)).toEqual(
        firstReadStepKeys,
      );
      expect(steps).toContainEqual({
        key: 'HANDOVER_DEALS',
        kind: 'WORKFLOW',
        permissionFlag: 'WORKFLOWS',
      });
      expect(completedSteps).not.toContain('CONNECT_MAILBOX');
    });

    it('drops stored steps the catalog no longer has', async () => {
      const storedSteps = await findJaneUserVar('GETTING_STARTED_STEPS');

      await globalThis.testDataSource.query(
        `UPDATE core."keyValuePair" SET "value" = $4 WHERE "workspaceId" = $1 AND "userId" = $2 AND "key" = $3`,
        [
          SEED_APPLE_WORKSPACE_ID,
          USER_DATA_SEED_IDS.JANE,
          'GETTING_STARTED_STEPS',
          JSON.stringify({
            ...storedSteps,
            steps: ['REMOVED_STEP', ...storedSteps.steps],
          }),
        ],
      );

      expect(await fetchStepKeys()).toEqual(storedSteps.steps);
    });
  });

  describe('updateGettingStarted', () => {
    it('persists the selected step, the snooze and the hide', async () => {
      const response = await makeMetadataApiRequest({
        query: UPDATE_GETTING_STARTED_MUTATION,
        variables: {
          input: {
            selectedStep: 'INVITE_TEAM',
            snoozedUntil: '2099-01-01T00:00:00.000Z',
            isHidden: true,
          },
        },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateGettingStarted).toEqual({
        selectedStep: 'INVITE_TEAM',
        snoozedUntil: '2099-01-01T00:00:00.000Z',
        isHidden: true,
      });
    });

    it('rejects a snooze date that is not ISO 8601', async () => {
      const response = await makeMetadataApiRequest({
        query: UPDATE_GETTING_STARTED_MUTATION,
        variables: { input: { snoozedUntil: 'tomorrow' } },
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    });
  });

  describe('updateGettingStarted step status', () => {
    it('marks any step done, then back to todo', async () => {
      const doneResponse = await updateStepStatus({
        step: 'INVITE_TEAM',
        status: 'DONE',
      });

      expect(doneResponse.body.errors).toBeUndefined();
      expect(
        doneResponse.body.data.updateGettingStarted.completedSteps,
      ).toContain('INVITE_TEAM');

      const todoResponse = await updateStepStatus({
        step: 'INVITE_TEAM',
        status: 'TODO',
      });

      expect(todoResponse.body.errors).toBeUndefined();
      expect(
        todoResponse.body.data.updateGettingStarted.completedSteps,
      ).not.toContain('INVITE_TEAM');
      expect(
        await findJaneUserVar('GETTING_STARTED_STEP_INVITE_TEAM'),
      ).toBeUndefined();
    });

    it('keeps the first completion when a step is done twice', async () => {
      await updateStepStatus({
        step: 'FOLLOW_UP_DEALS',
        status: 'DONE',
        threadId: '20202020-0000-4000-8000-000000000001',
      });

      const firstCompletion = await findJaneUserVar(
        'GETTING_STARTED_STEP_FOLLOW_UP_DEALS',
      );

      const secondResponse = await updateStepStatus({
        step: 'FOLLOW_UP_DEALS',
        status: 'DONE',
        threadId: '20202020-0000-4000-8000-000000000002',
      });

      expect(secondResponse.body.errors).toBeUndefined();
      expect(firstCompletion).toMatchObject({
        threadId: '20202020-0000-4000-8000-000000000001',
      });
      expect(
        await findJaneUserVar('GETTING_STARTED_STEP_FOLLOW_UP_DEALS'),
      ).toEqual(firstCompletion);
    });
  });

  describe('prepareGettingStartedWorkflow', () => {
    let handoverWorkflowId: string | undefined;

    afterAll(async () => {
      if (isDefined(handoverWorkflowId)) {
        await deleteCoreWorkflows({ coreWorkflowIds: [handoverWorkflowId] });
      }
    });

    it('rejects a step that is not a workflow step', async () => {
      const response = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_WORKFLOW_MUTATION,
        variables: { step: 'IMPORT_DATA', activate: false },
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    });

    it('reuses the draft, then activates it and completes the step', async () => {
      const firstResponse = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_WORKFLOW_MUTATION,
        variables: { step: 'HANDOVER_DEALS', activate: false },
      });

      expect(firstResponse.body.errors).toBeUndefined();

      const handover = firstResponse.body.data.prepareGettingStartedWorkflow;

      handoverWorkflowId = handover.workflowId;

      const secondResponse = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_WORKFLOW_MUTATION,
        variables: { step: 'HANDOVER_DEALS', activate: false },
      });

      expect(secondResponse.body.data.prepareGettingStartedWorkflow).toEqual(
        handover,
      );

      const activationResponse = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_WORKFLOW_MUTATION,
        variables: { step: 'HANDOVER_DEALS', activate: true },
      });

      expect(activationResponse.body.errors).toBeUndefined();
      expect(
        activationResponse.body.data.prepareGettingStartedWorkflow,
      ).toEqual(handover);

      const reactivationResponse = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_WORKFLOW_MUTATION,
        variables: { step: 'HANDOVER_DEALS', activate: true },
      });

      expect(reactivationResponse.body.errors).toBeUndefined();

      const version = await findCoreWorkflowVersion({
        coreWorkflowVersionId: handover.versionId,
      });

      expect(version.status).toBe('ACTIVE');

      const progressResponse = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(
        progressResponse.body.data.gettingStartedProgress.completedSteps,
      ).toContain('HANDOVER_DEALS');
    });
  });
});
