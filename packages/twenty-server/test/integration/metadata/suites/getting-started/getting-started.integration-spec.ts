import { gql } from 'graphql-tag';
import {
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
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
      steps
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

const prepareGettingStartedWorkflow = (step: string, activate: boolean) =>
  makeMetadataApiRequest({
    query: PREPARE_GETTING_STARTED_WORKFLOW_MUTATION,
    variables: { step, activate },
  });

const prepareHandoverWorkflow = (activate: boolean) =>
  prepareGettingStartedWorkflow('HANDOVER_DEALS', activate);

describe('gettingStarted (e2e)', () => {
  beforeAll(deleteGettingStartedUserVars);
  afterAll(deleteGettingStartedUserVars);

  describe('gettingStartedProgress', () => {
    it('lists the steps in order and completes the connected mailbox step', async () => {
      const response = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(response.body.errors).toBeUndefined();

      const { steps, completedSteps } =
        response.body.data.gettingStartedProgress;

      expect(steps).toEqual([
        'CONNECT_MAILBOX',
        'IMPORT_DATA',
        'INSTALL_APP',
        'INVITE_TEAM',
        'HANDOVER_DEALS',
        'FOLLOW_UP_DEALS',
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
        expect(response.body.data.gettingStartedProgress.steps).not.toContain(
          'HANDOVER_DEALS',
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
      const response = await prepareGettingStartedWorkflow(
        'FOLLOW_UP_DEALS',
        false,
      );

      expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
        'INVALID_STEP',
      );
      expect(
        await findWorkspaceUserVar('GETTING_STARTED_WORKFLOW_FOLLOW_UP_DEALS'),
      ).toBeUndefined();
    });

    it("refuses to turn on a draft that sends from another member's mailbox", async () => {
      const draftResponse = await prepareHandoverWorkflow(false);

      expect(draftResponse.body.errors).toBeUndefined();

      const draft = draftResponse.body.data.prepareGettingStartedWorkflow;

      try {
        const [draftVersion]: {
          steps: {
            type: string;
            settings: { input: Record<string, unknown> };
          }[];
        }[] = await globalThis.testDataSource.query(
          `SELECT "steps" FROM core."workflowVersion" WHERE "id" = $1`,
          [draft.versionId],
        );

        const stepsSendingFromTimMailbox = draftVersion.steps.map((step) =>
          step.type === 'SEND_EMAIL'
            ? {
                ...step,
                settings: {
                  ...step.settings,
                  input: {
                    ...step.settings.input,
                    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
                  },
                },
              }
            : step,
        );

        await globalThis.testDataSource.query(
          `UPDATE core."workflowVersion" SET "steps" = $2::jsonb WHERE "id" = $1`,
          [draft.versionId, JSON.stringify(stepsSendingFromTimMailbox)],
        );

        const activationResponse = await prepareHandoverWorkflow(true);

        expect(activationResponse.body.errors?.[0]?.extensions?.subCode).toBe(
          'MAILBOX_NOT_USABLE',
        );
        expect(
          (
            await findCoreWorkflowVersion({
              coreWorkflowVersionId: draft.versionId,
            })
          ).status,
        ).toBe('DRAFT');
      } finally {
        await deleteCoreWorkflows({ coreWorkflowIds: [draft.workflowId] });
      }
    });

    it('reuses the draft, then activates it and completes the handover step', async () => {
      const firstResponse = await prepareHandoverWorkflow(false);

      expect(firstResponse.body.errors).toBeUndefined();

      const handover = firstResponse.body.data.prepareGettingStartedWorkflow;

      handoverWorkflowId = handover.workflowId;

      expect(
        await findWorkspaceUserVar('GETTING_STARTED_WORKFLOW_HANDOVER_DEALS'),
      ).toEqual(handover);

      const secondResponse = await prepareHandoverWorkflow(false);

      expect(secondResponse.body.data.prepareGettingStartedWorkflow).toEqual(
        handover,
      );

      const activationResponse = await prepareHandoverWorkflow(true);

      expect(activationResponse.body.errors).toBeUndefined();
      expect(
        activationResponse.body.data.prepareGettingStartedWorkflow,
      ).toEqual(handover);

      const reactivationResponse = await prepareHandoverWorkflow(true);

      expect(reactivationResponse.body.errors).toBeUndefined();

      const version = await findCoreWorkflowVersion({
        coreWorkflowVersionId: handover.versionId,
      });

      expect(version.status).toBe('ACTIVE');

      const emailStep = version.steps?.find(
        (step) => step.type === 'SEND_EMAIL',
      );
      const [sender]: { userWorkspaceId: string }[] =
        await globalThis.testDataSource.query(
          `SELECT "userWorkspaceId" FROM core."connectedAccount" WHERE "id" = $1`,
          [emailStep?.settings.input.connectedAccountId],
        );

      expect(sender?.userWorkspaceId).toBe(USER_WORKSPACE_DATA_SEED_IDS.JANE);

      const progressResponse = await makeMetadataApiRequest({
        query: GETTING_STARTED_PROGRESS_QUERY,
      });

      expect(
        progressResponse.body.data.gettingStartedProgress.completedSteps,
      ).toContain('HANDOVER_DEALS');
    });
  });
});
