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
      lastPublishedVersionId
    }
  }
`;

describe('discardCoreWorkflowDraft (e2e)', () => {
  let coreWorkflowId: string;
  let workspaceWorkflowId: string;
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
                  status
                }
              }
            }
          }
        }
      `,
      { id: workspaceWorkflowId },
    );

    draftWorkspaceVersionId =
      versionsResponse.body.data.workflow.versions.edges[0].node.id;
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
    expect(refreshedWorkflow.statuses).toEqual([]);
    expect(refreshedWorkflow.lastPublishedVersionId).toBeNull();

    const workspaceRows = await global.testDataSource.query(
      `SELECT "deletedAt" FROM "${WORKSPACE_SCHEMA}"."workflowVersion" WHERE id = $1`,
      [draftWorkspaceVersionId],
    );

    expect(workspaceRows[0]?.deletedAt).not.toBeNull();

    const coreVersionRows = await global.testDataSource.query(
      `SELECT id FROM core."workflowVersion"
       WHERE "workspaceId" = $1 AND "workflowId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, workspaceWorkflowId],
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
});
