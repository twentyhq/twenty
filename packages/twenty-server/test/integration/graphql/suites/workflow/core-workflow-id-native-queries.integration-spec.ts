import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const CORE_WORKFLOW_BY_ID = `
  query CoreWorkflowById($id: UUID!) {
    coreWorkflowById(id: $id) {
      id
      name
      statuses
      workspaceWorkflowId
    }
  }
`;

const CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID = `
  query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
    coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
      id
      label
      status
      workspaceWorkflowId
      workspaceWorkflowVersionId
    }
  }
`;

const CORE_WORKFLOW_VERSION_BY_ID = `
  query CoreWorkflowVersionById($id: UUID!) {
    coreWorkflowVersionById(id: $id) {
      id
      label
      status
      trigger
      steps
    }
  }
`;

const ABSENT_ID = '00000000-0000-4000-8000-000000000000';

describe('core workflow id native queries (e2e)', () => {
  let coreWorkflowId: string;
  let workspaceWorkflowId: string;

  beforeAll(async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "Core Id Native Queries" }) {
          id
          workspaceWorkflowId
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;
    workspaceWorkflowId =
      createResponse.body.data.createCoreWorkflow.workspaceWorkflowId;
  });

  afterAll(async () => {
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
  });

  it('resolves the workflow by its core id', async () => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOW_BY_ID, {
      id: coreWorkflowId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowById.id).toBe(coreWorkflowId);
    expect(response.body.data.coreWorkflowById.name).toBe(
      'Core Id Native Queries',
    );
    expect(response.body.data.coreWorkflowById.statuses).toContain('DRAFT');
  });

  it('does not resolve a workspace workflow id through the core id query', async () => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOW_BY_ID, {
      id: workspaceWorkflowId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowById).toBeNull();
  });

  it('lists the versions by core workflow id', async () => {
    const response = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID,
      { coreWorkflowId },
    );

    expect(response.body.errors).toBeUndefined();

    const versions = response.body.data.coreWorkflowVersionsByCoreWorkflowId;

    expect(versions).toHaveLength(1);
    expect(versions[0].status).toBe('DRAFT');
    expect(versions[0].label).toBe('v1');
    expect(versions[0].workspaceWorkflowId).toBe(workspaceWorkflowId);
    expect(versions[0].workspaceWorkflowVersionId).not.toBeNull();
  });

  it('resolves a version by its core id, with its content', async () => {
    const versionsResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID,
      { coreWorkflowId },
    );

    const coreWorkflowVersionId =
      versionsResponse.body.data.coreWorkflowVersionsByCoreWorkflowId[0].id;

    const response = await workflowGraphqlRequest(CORE_WORKFLOW_VERSION_BY_ID, {
      id: coreWorkflowVersionId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowVersionById.id).toBe(
      coreWorkflowVersionId,
    );
    expect(response.body.data.coreWorkflowVersionById.label).toBe('v1');
  });

  it('returns nothing for ids that exist in neither table', async () => {
    const workflowResponse = await workflowGraphqlRequest(CORE_WORKFLOW_BY_ID, {
      id: ABSENT_ID,
    });

    expect(workflowResponse.body.data.coreWorkflowById).toBeNull();

    const versionResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSION_BY_ID,
      { id: ABSENT_ID },
    );

    expect(versionResponse.body.data.coreWorkflowVersionById).toBeNull();

    const versionsResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID,
      { coreWorkflowId: ABSENT_ID },
    );

    expect(
      versionsResponse.body.data.coreWorkflowVersionsByCoreWorkflowId,
    ).toEqual([]);
  });
});
