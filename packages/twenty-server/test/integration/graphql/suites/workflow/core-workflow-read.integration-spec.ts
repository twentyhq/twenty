import { isDefined } from 'twenty-shared/utils';

import { pollWorkflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/poll-workflow-graphql-request.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const CORE_WORKFLOW_QUERY = `
  query CoreWorkflow($workspaceWorkflowId: UUID!) {
    coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
      id
      name
      statuses
      lastPublishedVersionId
      workspaceWorkflowId
      updatedAt
    }
  }
`;

const CORE_WORKFLOW_VERSIONS_QUERY = `
  query CoreWorkflowVersions($workspaceWorkflowId: UUID!) {
    coreWorkflowVersions(workspaceWorkflowId: $workspaceWorkflowId) {
      id
      label
      status
      workspaceWorkflowVersionId
      createdAt
      updatedAt
    }
  }
`;

const CORE_WORKFLOW_VERSION_QUERY = `
  query CoreWorkflowVersion($workspaceWorkflowVersionId: UUID!) {
    coreWorkflowVersion(
      workspaceWorkflowVersionId: $workspaceWorkflowVersionId
    ) {
      id
      label
      status
      workspaceWorkflowVersionId
      trigger
      steps
      createdAt
      updatedAt
    }
  }
`;

type CoreWorkflowResult = {
  id: string;
  name: string | null;
  statuses: string[];
  lastPublishedVersionId: string | null;
  workspaceWorkflowId: string | null;
  updatedAt: string;
};

type CoreWorkflowVersionResult = {
  id: string;
  label: string;
  status: string;
  workspaceWorkflowVersionId: string | null;
  createdAt: string;
  updatedAt: string;
};

const CORE_WORKFLOWS_WITH_VERSIONS_QUERY = `
  query CoreWorkflowsWithVersions($workspaceWorkflowIds: [UUID!]!) {
    coreWorkflowsWithVersions(workspaceWorkflowIds: $workspaceWorkflowIds) {
      id
      name
      statuses
      workspaceWorkflowId
      versions {
        id
        label
        status
        workspaceWorkflowVersionId
        createdAt
      }
      currentVersion {
        id
        status
        workspaceWorkflowVersionId
        workspaceWorkflowId
        trigger
        steps
      }
    }
  }
`;

describe('coreWorkflow (e2e)', () => {
  let workspaceWorkflowId: string;

  beforeAll(async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createWorkflow(data: { name: "Core Workflow Read" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    workspaceWorkflowId = createResponse.body.data.createWorkflow.id;
  });

  afterAll(async () => {
    if (!isDefined(workspaceWorkflowId)) {
      return;
    }

    await workflowGraphqlRequest(
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

  it('should read one workflow by its workspace id', async () => {
    const coreWorkflow = await pollWorkflowGraphqlRequest<
      { coreWorkflow: CoreWorkflowResult | null },
      CoreWorkflowResult | null | undefined
    >({
      query: CORE_WORKFLOW_QUERY,
      variables: { workspaceWorkflowId },
      extract: (data) => data?.coreWorkflow,
      until: isDefined,
    });

    expect(coreWorkflow).toEqual({
      id: expect.any(String),
      name: 'Core Workflow Read',
      statuses: ['DRAFT'],
      lastPublishedVersionId: null,
      workspaceWorkflowId,
      updatedAt: expect.any(String),
    });
  });

  it('should return null for a workflow that does not exist', async () => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOW_QUERY, {
      workspaceWorkflowId: '00000000-0000-4000-8000-000000000000',
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflow).toBeNull();
  });

  it('should expose the version content the show page renders', async () => {
    const versions = await pollWorkflowGraphqlRequest<
      { coreWorkflowVersions: CoreWorkflowVersionResult[] },
      CoreWorkflowVersionResult[]
    >({
      query: CORE_WORKFLOW_VERSIONS_QUERY,
      variables: { workspaceWorkflowId },
      extract: (data) => data?.coreWorkflowVersions ?? [],
      until: (polledVersions) =>
        polledVersions.length === 1 &&
        isDefined(polledVersions[0].workspaceWorkflowVersionId),
    });

    expect(versions).toEqual([
      {
        id: expect.any(String),
        label: 'v1',
        status: 'DRAFT',
        workspaceWorkflowVersionId: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);

    const versionResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSION_QUERY,
      {
        workspaceWorkflowVersionId: versions[0].workspaceWorkflowVersionId,
      },
    );

    expect(versionResponse.body.errors).toBeUndefined();
    expect(versionResponse.body.data.coreWorkflowVersion).toEqual(
      expect.objectContaining({
        workspaceWorkflowVersionId: versions[0].workspaceWorkflowVersionId,
        status: 'DRAFT',
        updatedAt: expect.any(String),
      }),
    );
  });

  it('should read many workflows with their versions and current version in one query', async () => {
    const response = await workflowGraphqlRequest(
      CORE_WORKFLOWS_WITH_VERSIONS_QUERY,
      { workspaceWorkflowIds: [workspaceWorkflowId] },
    );

    expect(response.body.errors).toBeUndefined();

    const coreWorkflows = response.body.data.coreWorkflowsWithVersions;

    expect(coreWorkflows).toHaveLength(1);
    expect(coreWorkflows[0]).toEqual(
      expect.objectContaining({
        workspaceWorkflowId,
        name: 'Core Workflow Read',
      }),
    );
    expect(coreWorkflows[0].versions).toHaveLength(1);
    expect(coreWorkflows[0].currentVersion).toEqual(
      expect.objectContaining({
        workspaceWorkflowVersionId:
          coreWorkflows[0].versions[0].workspaceWorkflowVersionId,
        workspaceWorkflowId,
        status: 'DRAFT',
      }),
    );
  });

  it('should return nothing for workspace workflow ids of another workspace', async () => {
    const response = await workflowGraphqlRequest(
      CORE_WORKFLOWS_WITH_VERSIONS_QUERY,
      { workspaceWorkflowIds: ['20202020-0000-4000-8000-000000000000'] },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowsWithVersions).toEqual([]);
  });
});
