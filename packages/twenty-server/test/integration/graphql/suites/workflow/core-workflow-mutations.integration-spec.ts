import request from 'supertest';
import { deleteCoreWorkflows } from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { isDefined } from 'twenty-shared/utils';

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
    if (!isDefined(coreWorkflowId)) {
      return;
    }

    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  it('should create a workflow listed synchronously with a draft version and no workspace record', async () => {
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
    expect(createdCoreWorkflow.workspaceWorkflowId).toBeNull();

    coreWorkflowId = createdCoreWorkflow.id;

    const listedCoreWorkflow = await findListedCoreWorkflowById(coreWorkflowId);

    expect(listedCoreWorkflow).toBeDefined();
    expect(listedCoreWorkflow?.statuses).toEqual(['DRAFT']);
    expect(listedCoreWorkflow?.workspaceWorkflowId).toBeNull();

    const coreVersionRows: {
      status: string;
      workflowId: string | null;
      workspaceWorkflowVersionId: string | null;
    }[] = await global.testDataSource.query(
      `SELECT status, "workflowId", "workspaceWorkflowVersionId" FROM core."workflowVersion" WHERE "coreWorkflowId" = $1`,
      [coreWorkflowId],
    );

    expect(coreVersionRows).toEqual([
      { status: 'DRAFT', workflowId: null, workspaceWorkflowVersionId: null },
    ]);
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
      { id: coreWorkflowId, workspaceWorkflowId: null },
    ]);

    expect(await findListedCoreWorkflowById(coreWorkflowId)).toBeUndefined();
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

    await deleteCoreWorkflows({ coreWorkflowIds: [createdCoreWorkflow.id] });
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

  it('should accept the v5 core workflow ids that prefilled workflows use', async () => {
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
        input: { coreWorkflowIds: ['00000000-0000-5000-8000-000000000000'] },
      },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([]);
  });
});
