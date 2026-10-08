import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const DISCARD_MUTATION = `
  mutation Discard($input: DiscardCoreWorkflowDraftInput!) {
    discardCoreWorkflowDraft(input: $input) {
      id
      statuses
    }
  }
`;

describe('discardCoreWorkflowDraft (e2e)', () => {
  let coreWorkflowId: string;
  let workspaceWorkflowId: string;
  let initialWorkspaceVersionId: string;
  let draftWorkspaceVersionId: string;

  beforeAll(async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "Discard Draft Target" }) {
          id
          workspaceWorkflowId
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;
    workspaceWorkflowId =
      createResponse.body.data.createCoreWorkflow.workspaceWorkflowId;

    const versionsResponse = await workflowGraphqlRequest(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
            versions {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `,
      { id: workspaceWorkflowId },
    );

    initialWorkspaceVersionId =
      versionsResponse.body.data.workflow.versions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId: initialWorkspaceVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const stepResponse = await workflowGraphqlRequest(
      `
        mutation CreateWorkflowVersionStep(
          $input: CreateWorkflowVersionStepInput!
        ) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId: initialWorkspaceVersionId,
          stepType: 'FIND_RECORDS',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(stepResponse.body.errors).toBeUndefined();

    const activateResponse = await workflowGraphqlRequest(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId: initialWorkspaceVersionId },
    );

    expect(activateResponse.body.errors).toBeUndefined();

    const draftResponse = await workflowGraphqlRequest(
      `
        mutation CreateDraft($input: CreateDraftFromWorkflowVersionInput!) {
          createDraftFromWorkflowVersion(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          workflowId: workspaceWorkflowId,
          workflowVersionIdToCopy: initialWorkspaceVersionId,
        },
      },
    );

    expect(draftResponse.body.errors).toBeUndefined();
    draftWorkspaceVersionId =
      draftResponse.body.data.createDraftFromWorkflowVersion.id;
  });

  afterAll(async () => {
    if (isDefined(workspaceWorkflowId)) {
      await workflowGraphqlRequest(
        `
          mutation DestroyWorkflow($id: ID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: workspaceWorkflowId },
      );
    }
  });

  it('soft-deletes the workspace draft, removes its core row and returns the refreshed workflow', async () => {
    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { workspaceWorkflowVersionId: draftWorkspaceVersionId },
    });

    expect(discardResponse.body.errors).toBeUndefined();

    const refreshedWorkflow =
      discardResponse.body.data.discardCoreWorkflowDraft;

    expect(refreshedWorkflow.id).toBe(coreWorkflowId);
    expect(refreshedWorkflow.statuses).not.toContain('DRAFT');

    const workspaceRows = await global.testDataSource.query(
      `SELECT "deletedAt" FROM "${WORKSPACE_SCHEMA}"."workflowVersion" WHERE id = $1`,
      [draftWorkspaceVersionId],
    );

    expect(workspaceRows[0]?.deletedAt).not.toBeNull();

    const coreVersionRows = await global.testDataSource.query(
      `SELECT cv.id FROM core."workflowVersion" cv
       JOIN "${WORKSPACE_SCHEMA}"."workflowVersion" wv
         ON wv."coreWorkflowVersionId" = cv.id
       WHERE cv."workspaceId" = $1 AND wv.id = $2`,
      [SEED_APPLE_WORKSPACE_ID, draftWorkspaceVersionId],
    );

    expect(coreVersionRows).toHaveLength(0);
  });

  it('returns null when the draft is already discarded', async () => {
    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { workspaceWorkflowVersionId: draftWorkspaceVersionId },
    });

    expect(discardResponse.body.errors).toBeUndefined();
    expect(discardResponse.body.data.discardCoreWorkflowDraft).toBeNull();
  });

  it('refuses to discard the only remaining version', async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "Only Version Guard" }) {
          workspaceWorkflowId
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    const guardedWorkspaceWorkflowId =
      createResponse.body.data.createCoreWorkflow.workspaceWorkflowId;

    const versionsResponse = await workflowGraphqlRequest(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
            versions {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `,
      { id: guardedWorkspaceWorkflowId },
    );

    const onlyVersionId =
      versionsResponse.body.data.workflow.versions.edges[0].node.id;

    const discardResponse = await workflowGraphqlRequest(DISCARD_MUTATION, {
      input: { workspaceWorkflowVersionId: onlyVersionId },
    });

    expect(discardResponse.body.errors?.[0]?.message).toContain(
      'initial version',
    );

    await workflowGraphqlRequest(
      `
        mutation DestroyWorkflow($id: ID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: guardedWorkspaceWorkflowId },
    );
  });
});
