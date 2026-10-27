import { gql } from 'graphql-tag';
import {
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
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

const COMPLETE_GETTING_STARTED_STEP_MUTATION = gql`
  mutation CompleteGettingStartedStep(
    $input: CompleteGettingStartedStepInput!
  ) {
    completeGettingStartedStep(input: $input) {
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

describe('gettingStarted (e2e)', () => {
  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND ("userId" = $2 OR "userId" IS NULL) AND "key" LIKE 'GETTING_STARTED_%'`,
      [SEED_APPLE_WORKSPACE_ID, USER_DATA_SEED_IDS.JANE],
    );
  });

  describe('gettingStartedProgress', () => {
    it('lists the default track and derives the mailbox step', async () => {
      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();

      const { steps, completedSteps } =
        response.body.data.gettingStartedProgress;

      expect(steps.map(({ key }: { key: string }) => key)).toEqual([
        'CONNECT_MAILBOX',
        'IMPORT_DATA',
        'INSTALL_APP',
        'INVITE_TEAM',
        'HANDOVER_DEALS',
        'FOLLOW_UP_DEALS',
      ]);
      expect(steps).toContainEqual({
        key: 'HANDOVER_DEALS',
        kind: 'WORKFLOW',
        permissionFlag: 'WORKFLOWS',
      });
      expect(completedSteps).toContain('CONNECT_MAILBOX');
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

  describe('completeGettingStartedStep', () => {
    it('completes a step the client can complete', async () => {
      const response = await makeMetadataApiRequest({
        query: COMPLETE_GETTING_STARTED_STEP_MUTATION,
        variables: {
          input: {
            step: 'FOLLOW_UP_DEALS',
            threadId: '20202020-0000-4000-8000-000000000001',
          },
        },
      });

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.completeGettingStartedStep.completedSteps,
      ).toContain('FOLLOW_UP_DEALS');
    });

    it('rejects a step only the server can complete', async () => {
      const response = await makeMetadataApiRequest({
        query: COMPLETE_GETTING_STARTED_STEP_MUTATION,
        variables: { input: { step: 'INVITE_TEAM' } },
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
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
