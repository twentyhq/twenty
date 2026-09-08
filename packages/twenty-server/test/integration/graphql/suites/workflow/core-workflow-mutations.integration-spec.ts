import request from 'supertest';
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
          deleteCoreWorkflows(input: $input)
        }
      `,
      { input: { coreWorkflowIds: [coreWorkflowId] } },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([
      coreWorkflowId,
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

  it('should delete nothing for unknown core workflow ids', async () => {
    const deleteResponse = await graphql(
      `
        mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
          deleteCoreWorkflows(input: $input)
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
