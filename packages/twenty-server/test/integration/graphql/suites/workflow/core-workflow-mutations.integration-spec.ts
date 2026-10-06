import {
  DELETE_CORE_WORKFLOWS_MUTATION,
  deleteCoreWorkflows,
  findCoreWorkflowById,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';

const LIST_CORE_WORKFLOWS_QUERY = `
  query CoreWorkflows {
    coreWorkflows(first: 200) {
      edges {
        node {
          id
          name
          statuses
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const CORE_WORKFLOW_VERSIONS_QUERY = `
  query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
    coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
      id
      label
      status
    }
  }
`;

type CoreWorkflow = {
  id: string;
  name: string | null;
  statuses: string[];
};

describe('coreWorkflow mutations (e2e)', () => {
  let coreWorkflowId: string;

  const findListedCoreWorkflowById = async (
    id: string,
  ): Promise<CoreWorkflow | undefined> => {
    const response = await workflowGraphqlRequest(LIST_CORE_WORKFLOWS_QUERY);

    expect(response.body.errors).toBeUndefined();

    return (response.body.data.coreWorkflows.edges as { node: CoreWorkflow }[])
      .map((edge) => edge.node)
      .find((workflow) => workflow.id === id);
  };

  afterAll(async () => {
    if (!isDefined(coreWorkflowId)) {
      return;
    }

    await deleteCoreWorkflows([coreWorkflowId]);
  });

  it('should create a workflow listed synchronously with a draft version', async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "Core Created Workflow" }) {
          id
          name
          statuses
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    const createdCoreWorkflow = createResponse.body.data.createCoreWorkflow;

    expect(createdCoreWorkflow.name).toBe('Core Created Workflow');
    expect(createdCoreWorkflow.statuses).toEqual(['DRAFT']);

    coreWorkflowId = createdCoreWorkflow.id;

    const listedCoreWorkflow = await findListedCoreWorkflowById(coreWorkflowId);

    expect(listedCoreWorkflow).toBeDefined();
    expect(listedCoreWorkflow?.name).toBe('Core Created Workflow');
    expect(listedCoreWorkflow?.statuses).toEqual(['DRAFT']);

    const versionsResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSIONS_QUERY,
      { coreWorkflowId },
    );

    expect(versionsResponse.body.errors).toBeUndefined();

    const versions =
      versionsResponse.body.data.coreWorkflowVersionsByCoreWorkflowId;

    expect(versions).toHaveLength(1);
    expect(versions[0].label).toBe('v1');
    expect(versions[0].status).toBe('DRAFT');
  });

  it('should delete workflows and unlist them synchronously', async () => {
    const deleteResponse = await workflowGraphqlRequest(
      DELETE_CORE_WORKFLOWS_MUTATION,
      { input: { coreWorkflowIds: [coreWorkflowId] } },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([
      { id: coreWorkflowId },
    ]);

    expect(await findListedCoreWorkflowById(coreWorkflowId)).toBeUndefined();
    expect(await findCoreWorkflowById(coreWorkflowId)).toBeNull();
  });

  it('should report nothing when deleting the same workflows again', async () => {
    const deleteResponse = await workflowGraphqlRequest(
      DELETE_CORE_WORKFLOWS_MUTATION,
      { input: { coreWorkflowIds: [coreWorkflowId] } },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([]);
  });

  it('should create a workflow from an empty input like the index does', async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: {}) {
          id
          name
          statuses
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

    await deleteCoreWorkflows([createdCoreWorkflow.id]);
  });

  it('should delete nothing for unknown core workflow ids', async () => {
    const deleteResponse = await workflowGraphqlRequest(
      DELETE_CORE_WORKFLOWS_MUTATION,
      {
        input: { coreWorkflowIds: ['00000000-0000-4000-8000-000000000000'] },
      },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([]);
  });

  it('should accept the v5 core workflow ids that prefilled workflows use', async () => {
    const deleteResponse = await workflowGraphqlRequest(
      DELETE_CORE_WORKFLOWS_MUTATION,
      {
        input: { coreWorkflowIds: ['00000000-0000-5000-8000-000000000000'] },
      },
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([]);
  });
});
