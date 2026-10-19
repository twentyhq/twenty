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
      completedSteps
      selectedStep
      snoozedUntil
    }
  }
`;

const UPDATE_GETTING_STARTED_MUTATION = gql`
  mutation UpdateGettingStarted($input: UpdateGettingStartedInput!) {
    updateGettingStarted(input: $input) {
      creditsEarned
      completedSteps
      selectedStep
      snoozedUntil
    }
  }
`;

const PREPARE_GETTING_STARTED_HANDOVER_MUTATION = gql`
  mutation PrepareGettingStartedHandover($activate: Boolean!) {
    prepareGettingStartedHandover(activate: $activate) {
      workflowId
      versionId
    }
  }
`;

describe('gettingStarted (e2e)', () => {
  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND ("userId" = $2 OR "userId" IS NULL) AND "key" LIKE 'gettingStarted.%'`,
      [SEED_APPLE_WORKSPACE_ID, USER_DATA_SEED_IDS.JANE],
    );
  });

  describe('gettingStartedProgress', () => {
    it('derives the mailbox step for a user with a connected mailbox', async () => {
      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.gettingStartedProgress.completedSteps,
      ).toContain('CONNECT_MAILBOX');
    });
  });

  describe('updateGettingStarted', () => {
    it('persists the completed step, the selected step and the snooze', async () => {
      await makeMetadataApiRequest({
        query: UPDATE_GETTING_STARTED_MUTATION,
        variables: { input: { completedStep: 'IMPORT_DATA' } },
      });

      const response = await makeMetadataApiRequest({
        query: UPDATE_GETTING_STARTED_MUTATION,
        variables: {
          input: {
            selectedStep: 'INVITE_TEAM',
            snoozedUntil: '2099-01-01T00:00:00.000Z',
          },
        },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateGettingStarted).toMatchObject({
        selectedStep: 'INVITE_TEAM',
        snoozedUntil: '2099-01-01T00:00:00.000Z',
      });
      expect(response.body.data.updateGettingStarted.completedSteps).toContain(
        'IMPORT_DATA',
      );
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

  describe('prepareGettingStartedHandover', () => {
    let handoverWorkflowId: string | undefined;

    afterAll(async () => {
      if (isDefined(handoverWorkflowId)) {
        await deleteCoreWorkflows({ coreWorkflowIds: [handoverWorkflowId] });
      }
    });

    it('reuses the draft, then activates it and completes the step', async () => {
      const firstResponse = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_HANDOVER_MUTATION,
        variables: { activate: false },
      });

      expect(firstResponse.body.errors).toBeUndefined();

      const handover = firstResponse.body.data.prepareGettingStartedHandover;

      handoverWorkflowId = handover.workflowId;

      const secondResponse = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_HANDOVER_MUTATION,
        variables: { activate: false },
      });

      expect(secondResponse.body.data.prepareGettingStartedHandover).toEqual(
        handover,
      );

      const activationResponse = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_HANDOVER_MUTATION,
        variables: { activate: true },
      });

      expect(activationResponse.body.errors).toBeUndefined();
      expect(
        activationResponse.body.data.prepareGettingStartedHandover,
      ).toEqual(handover);

      const reactivationResponse = await makeMetadataApiRequest({
        query: PREPARE_GETTING_STARTED_HANDOVER_MUTATION,
        variables: { activate: true },
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
