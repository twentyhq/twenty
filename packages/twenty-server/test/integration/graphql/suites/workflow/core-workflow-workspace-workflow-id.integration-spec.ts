import request from 'supertest';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

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

describe('core workflow workspaceWorkflowId dual write (e2e)', () => {
  let workflowId: string;

  const fetchWorkspaceCoreWorkflowId = async (): Promise<
    string | null | undefined
  > => {
    const rows = await global.testDataSource.query(
      `SELECT "coreWorkflowId" FROM "${WORKSPACE_SCHEMA}"."workflow" WHERE "id" = $1`,
      [workflowId],
    );

    return rows[0]?.coreWorkflowId;
  };

  const waitForWorkspaceCoreWorkflowId = async (): Promise<
    string | null | undefined
  > => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const coreWorkflowId = await fetchWorkspaceCoreWorkflowId();

      if (isDefined(coreWorkflowId)) {
        return coreWorkflowId;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    return fetchWorkspaceCoreWorkflowId();
  };

  const fetchWorkspaceWorkflowIdOnCoreRow = async (
    coreWorkflowId: string,
  ): Promise<string | null | undefined> => {
    const rows = await global.testDataSource.query(
      `SELECT "workspaceWorkflowId" FROM core."workflow"
       WHERE "id" = $1 AND "workspaceId" = $2`,
      [coreWorkflowId, SEED_APPLE_WORKSPACE_ID],
    );

    return rows[0]?.workspaceWorkflowId;
  };

  const waitForWorkspaceWorkflowIdOnCoreRow = async (
    coreWorkflowId: string,
  ): Promise<string | null | undefined> => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const workspaceWorkflowId =
        await fetchWorkspaceWorkflowIdOnCoreRow(coreWorkflowId);

      if (isDefined(workspaceWorkflowId)) {
        return workspaceWorkflowId;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    return fetchWorkspaceWorkflowIdOnCoreRow(coreWorkflowId);
  };

  beforeAll(async () => {
    const createResponse = await graphql(`
      mutation {
        createWorkflow(data: { name: "Workspace Workflow Id Dual Write" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();
    workflowId = createResponse.body.data.createWorkflow.id;
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

  it('stamps the core workflow row with the workspace workflow id it mirrors', async () => {
    const coreWorkflowId = await waitForWorkspaceCoreWorkflowId();

    assertIsDefinedOrThrow(coreWorkflowId);

    expect(await waitForWorkspaceWorkflowIdOnCoreRow(coreWorkflowId)).toBe(
      workflowId,
    );
  });
});
