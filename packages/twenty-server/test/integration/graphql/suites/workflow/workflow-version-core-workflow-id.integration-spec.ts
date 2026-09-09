import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 250;

describe('workflow version core workflow id dual write (e2e)', () => {
  let workflowId: string;
  let workflowVersionId: string;

  const fetchWorkspaceCoreWorkflowId = async (): Promise<string | null> => {
    const rows = await global.testDataSource.query(
      `SELECT "coreWorkflowId" FROM "${WORKSPACE_SCHEMA}"."workflow" WHERE "id" = $1`,
      [workflowId],
    );

    return rows[0]?.coreWorkflowId ?? null;
  };

  const waitForWorkspaceCoreWorkflowId = async (): Promise<string | null> => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const coreWorkflowId = await fetchWorkspaceCoreWorkflowId();

      if (coreWorkflowId !== null) {
        return coreWorkflowId;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    return fetchWorkspaceCoreWorkflowId();
  };

  const countCoreVersionRowsPointingAt = async (
    coreWorkflowId: string,
  ): Promise<number> => {
    const rows = await global.testDataSource.query(
      `SELECT cv."id" FROM core."workflowVersion" cv
       JOIN core."workflow" cw ON cw."id" = cv."coreWorkflowId"
       WHERE cv."workspaceId" = $1
         AND cv."workflowId" = $2
         AND cv."coreWorkflowId" = $3`,
      [SEED_APPLE_WORKSPACE_ID, workflowId, coreWorkflowId],
    );

    return rows.length;
  };

  const waitForCoreVersionRowsPointingAt = async (
    coreWorkflowId: string,
  ): Promise<number> => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const count = await countCoreVersionRowsPointingAt(coreWorkflowId);

      if (count > 0) {
        return count;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    return countCoreVersionRowsPointingAt(coreWorkflowId);
  };

  beforeAll(async () => {
    const createResponse = await graphql(`
      mutation {
        createWorkflow(data: { name: "Core Workflow Id Dual Write" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();
    workflowId = createResponse.body.data.createWorkflow.id;

    const getResponse = await graphql(
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
      { id: workflowId },
    );

    workflowVersionId =
      getResponse.body.data.workflow.versions.edges[0].node.id;
  });

  afterAll(async () => {
    if (workflowId) {
      await graphql(
        `
          mutation DestroyWorkflow($id: ID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: workflowId },
      );
    }
  });

  it('stamps the core version row with the core workflow id on mirror writes', async () => {
    const coreWorkflowId = await waitForWorkspaceCoreWorkflowId();

    expect(coreWorkflowId).not.toBeNull();

    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    expect(
      await waitForCoreVersionRowsPointingAt(coreWorkflowId as string),
    ).toBeGreaterThan(0);
  });
});
