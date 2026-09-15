import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

const LIST_CORE_WORKFLOWS_QUERY = `
  query CoreWorkflows {
    coreWorkflows(first: 200) {
      edges {
        node {
          id
          name
          statuses
          workspaceWorkflowId
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

type CoreWorkflow = {
  id: string;
  name: string | null;
  statuses: string[];
  workspaceWorkflowId: string | null;
};

describe('coreWorkflow mutations (e2e)', () => {
  let coreWorkflowId: string;
  let workspaceWorkflowId: string;

  const findListedCoreWorkflowById = async (
    id: string,
  ): Promise<CoreWorkflow | undefined> => {
    const response = await graphql(LIST_CORE_WORKFLOWS_QUERY);

    expect(response.body.errors).toBeUndefined();

    return (response.body.data.coreWorkflows.edges as { node: CoreWorkflow }[])
      .map((edge) => edge.node)
      .find((workflow) => workflow.id === id);
  };

  afterAll(async () => {
    if (!isDefined(workspaceWorkflowId)) {
      return;
    }

    await graphql(
      `
        mutation DestroyWorkflow($id: UUID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: workspaceWorkflowId },
    );
  });

  it('should create a workflow listed synchronously with a draft version', async () => {
    const createResponse = await graphql(`
      mutation {
        createCoreWorkflow(input: { name: "Core Created Workflow" }) {
          id
          name
          statuses
          workspaceWorkflowId
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    const createdCoreWorkflow = createResponse.body.data.createCoreWorkflow;

    expect(createdCoreWorkflow.name).toBe('Core Created Workflow');
    expect(createdCoreWorkflow.statuses).toEqual(['DRAFT']);
    expect(createdCoreWorkflow.workspaceWorkflowId).toBeDefined();

    coreWorkflowId = createdCoreWorkflow.id;
    workspaceWorkflowId = createdCoreWorkflow.workspaceWorkflowId;

    const listedCoreWorkflow = await findListedCoreWorkflowById(coreWorkflowId);

    expect(listedCoreWorkflow).toBeDefined();
    expect(listedCoreWorkflow?.statuses).toEqual(['DRAFT']);
    expect(listedCoreWorkflow?.workspaceWorkflowId).toBe(workspaceWorkflowId);

    const storedCoreWorkflowRows = await global.testDataSource.query(
      `SELECT "workspaceWorkflowId" FROM core."workflow" WHERE "id" = $1`,
      [coreWorkflowId],
    );

    expect(storedCoreWorkflowRows[0]?.workspaceWorkflowId).toBe(
      workspaceWorkflowId,
    );

    const workspaceWorkflowResponse = await graphql(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
            id
            name
            versions {
              edges {
                node {
                  id
                  name
                  status
                }
              }
            }
          }
        }
      `,
      { id: workspaceWorkflowId },
    );

    expect(workspaceWorkflowResponse.body.errors).toBeUndefined();

    const workspaceWorkflow = workspaceWorkflowResponse.body.data.workflow;

    expect(workspaceWorkflow.name).toBe('Core Created Workflow');
    expect(workspaceWorkflow.versions.edges).toHaveLength(1);
    expect(workspaceWorkflow.versions.edges[0].node.name).toBe('v1');
    expect(workspaceWorkflow.versions.edges[0].node.status).toBe('DRAFT');
  });

  it('should delete workflows and unlist them synchronously', async () => {
    const deleteResponse = await graphql(
      `
        mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
          deleteCoreWorkflows(input: $input) {
            id
            workspaceWorkflowId
          }
        }
      `,
      { input: { coreWorkflowIds: [coreWorkflowId] } },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([
      { id: coreWorkflowId, workspaceWorkflowId },
    ]);

    expect(await findListedCoreWorkflowById(coreWorkflowId)).toBeUndefined();

    const softDeletedWorkflowResponse = await graphql(
      `
        query DeletedWorkflow($id: UUID!) {
          workflow(
            filter: { id: { eq: $id }, not: { deletedAt: { is: "NULL" } } }
          ) {
            id
          }
        }
      `,
      { id: workspaceWorkflowId },
    );

    expect(softDeletedWorkflowResponse.body.errors).toBeUndefined();
    expect(softDeletedWorkflowResponse.body.data.workflow?.id).toBe(
      workspaceWorkflowId,
    );
  });

  it('should report nothing when deleting the same workflows again', async () => {
    const deleteResponse = await graphql(
      `
        mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
          deleteCoreWorkflows(input: $input) {
            id
            workspaceWorkflowId
          }
        }
      `,
      { input: { coreWorkflowIds: [coreWorkflowId] } },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([]);
  });

  it('should create a workflow from an empty input like the index does', async () => {
    const createResponse = await graphql(`
      mutation {
        createCoreWorkflow(input: {}) {
          id
          name
          statuses
          workspaceWorkflowId
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    const createdCoreWorkflow = createResponse.body.data.createCoreWorkflow;

    expect(createdCoreWorkflow.name).toBeNull();
    expect(createdCoreWorkflow.statuses).toEqual(['DRAFT']);

    expect(
      await findListedCoreWorkflowById(createdCoreWorkflow.id),
    ).toBeDefined();

    await graphql(
      `
        mutation DestroyWorkflow($id: UUID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: createdCoreWorkflow.workspaceWorkflowId },
    );
  });

  it('should finish the cleanup on a retry after the core row is gone', async () => {
    const createResponse = await graphql(`
      mutation {
        createCoreWorkflow(input: { name: "Core Retry Delete" }) {
          id
          workspaceWorkflowId
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    const retryCoreWorkflowId = createResponse.body.data.createCoreWorkflow.id;
    const retryWorkspaceWorkflowId =
      createResponse.body.data.createCoreWorkflow.workspaceWorkflowId;

    const deleteMutation = `
      mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
        deleteCoreWorkflows(input: $input) {
          id
          workspaceWorkflowId
        }
      }
    `;

    const firstDeleteResponse = await graphql(deleteMutation, {
      input: { coreWorkflowIds: [retryCoreWorkflowId] },
    });

    expect(firstDeleteResponse.body.errors).toBeUndefined();
    expect(firstDeleteResponse.body.data.deleteCoreWorkflows).toEqual([
      {
        id: retryCoreWorkflowId,
        workspaceWorkflowId: retryWorkspaceWorkflowId,
      },
    ]);

    await global.testDataSource.query(
      `UPDATE "${TEST_SCHEMA_NAME}"."workflowVersion" SET "deletedAt" = NULL WHERE "workflowId" = $1`,
      [retryWorkspaceWorkflowId],
    );

    const retryDeleteResponse = await graphql(deleteMutation, {
      input: { coreWorkflowIds: [retryCoreWorkflowId] },
    });

    expect(retryDeleteResponse.body.errors).toBeUndefined();
    expect(retryDeleteResponse.body.data.deleteCoreWorkflows).toEqual([]);

    const workflowVersionRows: { deletedAt: Date | null }[] =
      await global.testDataSource.query(
        `SELECT "deletedAt" FROM "${TEST_SCHEMA_NAME}"."workflowVersion" WHERE "workflowId" = $1`,
        [retryWorkspaceWorkflowId],
      );

    expect(workflowVersionRows).toHaveLength(1);
    expect(workflowVersionRows[0].deletedAt).not.toBeNull();

    await graphql(
      `
        mutation DestroyWorkflow($id: UUID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: retryWorkspaceWorkflowId },
    );
  });

  it('should delete nothing for unknown core workflow ids', async () => {
    const deleteResponse = await graphql(
      `
        mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
          deleteCoreWorkflows(input: $input) {
            id
            workspaceWorkflowId
          }
        }
      `,
      {
        input: { coreWorkflowIds: ['00000000-0000-4000-8000-000000000000'] },
      },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([]);
  });
});
