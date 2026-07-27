import request from 'supertest';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

describe('workflow lifecycle core mirror (e2e)', () => {
  let workflowId: string;
  let alreadyDestroyed = false;

  const coreVersionRowCount = async (): Promise<number> => {
    const rows = await global.testDataSource.query(
      `SELECT "id" FROM core."workflowVersion"
       WHERE "workspaceId" = $1 AND "workflowId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, workflowId],
    );

    return rows.length;
  };

  beforeAll(async () => {
    const createResponse = await graphql(`
      mutation {
        createWorkflow(data: { name: "Lifecycle Mirror" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();
    workflowId = createResponse.body.data.createWorkflow.id;
  });

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

  it('removes the core version row on delete, recreates it on restore, removes it on destroy', async () => {
    // the v1 version created with the workflow is mirrored to core
    expect(await coreVersionRowCount()).toBeGreaterThan(0);

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
    expect(await coreVersionRowCount()).toBe(0);

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
    expect(await coreVersionRowCount()).toBeGreaterThan(0);

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
    expect(await coreVersionRowCount()).toBe(0);
  });
});
