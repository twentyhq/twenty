import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

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
  query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
    coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
      id
      label
      status
      trigger
      steps
    }
  }
`;

const CORE_WORKFLOW_VERSIONS_LEGACY = `
  query CoreWorkflowVersions($workspaceWorkflowId: UUID!) {
    coreWorkflowVersions(workspaceWorkflowId: $workspaceWorkflowId) {
      id
      label
      status
      workspaceWorkflowVersionId
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

  it('lists the versions by core workflow id, mirror ids included', async () => {
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
      coreWorkflowVersionId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowVersionById.id).toBe(
      coreWorkflowVersionId,
    );
    expect(response.body.data.coreWorkflowVersionById.label).toBe('v1');
  });

  it('agrees with the workspace-keyed query on the version list, labels included', async () => {
    const [byCoreId, byWorkspaceId] = await Promise.all([
      workflowGraphqlRequest(CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID, {
        coreWorkflowId,
      }),
      workflowGraphqlRequest(CORE_WORKFLOW_VERSIONS_LEGACY, {
        workspaceWorkflowId,
      }),
    ]);

    expect(byCoreId.body.errors).toBeUndefined();
    expect(byWorkspaceId.body.errors).toBeUndefined();

    const normalise = (
      versions: {
        id: string;
        label: string;
        status: string;
        workspaceWorkflowVersionId: string | null;
      }[],
    ) =>
      versions.map(({ id, label, status, workspaceWorkflowVersionId }) => ({
        id,
        label,
        status,
        workspaceWorkflowVersionId,
      }));

    expect(
      normalise(byCoreId.body.data.coreWorkflowVersionsByCoreWorkflowId),
    ).toEqual(normalise(byWorkspaceId.body.data.coreWorkflowVersions));
  });

  it('returns nothing for ids that exist in neither table', async () => {
    const versionResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSION_BY_ID,
      { coreWorkflowVersionId: ABSENT_ID },
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
