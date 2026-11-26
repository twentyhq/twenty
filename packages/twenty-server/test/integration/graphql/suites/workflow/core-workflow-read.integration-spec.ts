import { isDefined } from 'twenty-shared/utils';

import {
  createCoreWorkflow,
  deleteCoreWorkflows,
  linkCoreWorkflowToLegacyWorkspaceIds,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { pollWorkflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/poll-workflow-graphql-request.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const CORE_WORKFLOW_QUERY = `
  query CoreWorkflow($workspaceWorkflowId: UUID!) {
    coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
      id
      name
      statuses
      workspaceWorkflowId
      updatedAt
    }
  }
`;

const CORE_WORKFLOW_BY_ID_QUERY = `
  query CoreWorkflowById($coreWorkflowId: UUID!) {
    coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
      name
      statuses
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
      createdAt
      updatedAt
    }
  }
`;

const CORE_WORKFLOW_VERSION_BY_ID_QUERY = `
  query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
    coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
      id
      label
      status
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
  workspaceWorkflowId: string | null;
  updatedAt: string;
};

type CoreWorkflowVersionResult = {
  id: string;
  label: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

describe('coreWorkflow (e2e)', () => {
  let coreWorkflowId: string;
  let workspaceWorkflowId: string | null;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Core Workflow Read',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    ({ workspaceWorkflowId } = await linkCoreWorkflowToLegacyWorkspaceIds({
      coreWorkflowId,
    }));
  });

  afterAll(async () => {
    if (!isDefined(coreWorkflowId)) {
      return;
    }

    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
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

  it('should read one workflow by its core id', async () => {
    const coreWorkflow = await pollWorkflowGraphqlRequest<
      { coreWorkflow: CoreWorkflowResult | null },
      CoreWorkflowResult | null | undefined
    >({
      query: CORE_WORKFLOW_QUERY,
      variables: { workspaceWorkflowId },
      extract: (data) => data?.coreWorkflow,
      until: isDefined,
    });

    const response = await workflowGraphqlRequest(CORE_WORKFLOW_BY_ID_QUERY, {
      coreWorkflowId: coreWorkflow?.id,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowById).toEqual({
      id: coreWorkflow?.id,
      name: 'Core Workflow Read',
      statuses: ['DRAFT'],
      workspaceWorkflowId,
      updatedAt: expect.any(String),
    });
  });

  it('should return null for a core id that does not exist', async () => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOW_BY_ID_QUERY, {
      coreWorkflowId: '00000000-0000-4000-8000-000000000000',
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowById).toBeNull();
  });

  it('should expose the version content the show page renders', async () => {
    const versions = await pollWorkflowGraphqlRequest<
      { coreWorkflowVersions: CoreWorkflowVersionResult[] },
      CoreWorkflowVersionResult[]
    >({
      query: CORE_WORKFLOW_VERSIONS_QUERY,
      variables: { workspaceWorkflowId },
      extract: (data) => data?.coreWorkflowVersions ?? [],
      until: (polledVersions) => polledVersions.length === 1,
    });

    expect(versions).toEqual([
      {
        id: expect.any(String),
        label: 'v1',
        status: 'DRAFT',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);

    const versionResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSION_BY_ID_QUERY,
      { coreWorkflowVersionId: versions[0].id },
    );

    expect(versionResponse.body.errors).toBeUndefined();
    expect(versionResponse.body.data.coreWorkflowVersionById).toEqual(
      expect.objectContaining({
        id: versions[0].id,
        status: 'DRAFT',
        updatedAt: expect.any(String),
      }),
    );
  });
});
