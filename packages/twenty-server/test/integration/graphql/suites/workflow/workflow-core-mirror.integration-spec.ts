import request from 'supertest';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

const INITIAL_NAME = 'Core Mirror Workflow';
const RENAMED_NAME = 'Core Mirror Workflow Renamed';

const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 250;

describe('workflow core mirror (e2e)', () => {
  let workflowId: string;
  let alreadyDestroyed = false;

  const countCoreWorkflowsNamed = async (name: string): Promise<number> => {
    const rows = await global.testDataSource.query(
      `SELECT "id" FROM core."workflow"
       WHERE "workspaceId" = $1 AND "name" = $2`,
      [SEED_APPLE_WORKSPACE_ID, name],
    );

    return rows.length;
  };

  // the mirror is an async database-event listener, so the core row lands
  // shortly after the mutation returns rather than within it
  const waitForCoreWorkflowsNamed = async (
    name: string,
    expected: number,
  ): Promise<number> => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const count = await countCoreWorkflowsNamed(name);

      if (count === expected) {
        return count;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    return countCoreWorkflowsNamed(name);
  };

  afterAll(async () => {
    if (workflowId && !alreadyDestroyed) {
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

  it('mirrors the workflow to core across create, rename, delete, restore and destroy', async () => {
    const createResponse = await graphql(
      `
        mutation CreateWorkflow($name: String!) {
          createWorkflow(data: { name: $name }) {
            id
          }
        }
      `,
      { name: INITIAL_NAME },
    );

    expect(createResponse.body.errors).toBeUndefined();
    workflowId = createResponse.body.data.createWorkflow.id;

    expect(await waitForCoreWorkflowsNamed(INITIAL_NAME, 1)).toBe(1);

    const renameResponse = await graphql(
      `
        mutation RenameWorkflow($id: UUID!, $name: String!) {
          updateWorkflow(id: $id, data: { name: $name }) {
            id
          }
        }
      `,
      { id: workflowId, name: RENAMED_NAME },
    );

    expect(renameResponse.body.errors).toBeUndefined();
    expect(await waitForCoreWorkflowsNamed(RENAMED_NAME, 1)).toBe(1);
    expect(await waitForCoreWorkflowsNamed(INITIAL_NAME, 0)).toBe(0);

    const deleteResponse = await graphql(
      `
        mutation DeleteWorkflow($id: ID!) {
          deleteWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: workflowId },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(await waitForCoreWorkflowsNamed(RENAMED_NAME, 0)).toBe(0);

    const restoreResponse = await graphql(
      `
        mutation RestoreWorkflow($id: ID!) {
          restoreWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: workflowId },
    );

    expect(restoreResponse.body.errors).toBeUndefined();
    expect(await waitForCoreWorkflowsNamed(RENAMED_NAME, 1)).toBe(1);

    const destroyResponse = await graphql(
      `
        mutation DestroyWorkflow($id: ID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: workflowId },
    );

    expect(destroyResponse.body.errors).toBeUndefined();
    alreadyDestroyed = true;
    expect(await waitForCoreWorkflowsNamed(RENAMED_NAME, 0)).toBe(0);
  });
});
