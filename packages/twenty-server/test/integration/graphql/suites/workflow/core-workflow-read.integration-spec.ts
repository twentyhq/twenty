import { isDefined } from 'twenty-shared/utils';

import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const CORE_WORKFLOW_QUERY = `
  query CoreWorkflow($workspaceWorkflowId: UUID!) {
    coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
      id
    }
  }
`;

const CORE_WORKFLOW_BY_ID_QUERY = `
  query CoreWorkflowById($coreWorkflowId: UUID!) {
    coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
      name
      statuses
      lastPublishedVersionId
      updatedAt
    }
  }
`;

const CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID_QUERY = `
  query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
    coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
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

describe('coreWorkflow (e2e)', () => {
  let coreWorkflowId: string;

  beforeAll(async () => {
    ({ coreWorkflowId } = await createCoreWorkflow({
      name: 'Core Workflow Read',
    }));
  });

  afterAll(async () => {
    if (!isDefined(coreWorkflowId)) {
      return;
    }

    await deleteCoreWorkflows([coreWorkflowId]);
  });

  it('should return null for a workspace workflow id that does not exist', async () => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOW_QUERY, {
      workspaceWorkflowId: '00000000-0000-4000-8000-000000000000',
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflow).toBeNull();
  });

  it('should read one workflow by its core id', async () => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOW_BY_ID_QUERY, {
      coreWorkflowId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowById).toEqual({
      id: coreWorkflowId,
      name: 'Core Workflow Read',
      statuses: ['DRAFT'],
      lastPublishedVersionId: null,
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
    const versionsResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID_QUERY,
      { coreWorkflowId },
    );

    expect(versionsResponse.body.errors).toBeUndefined();

    const versions =
      versionsResponse.body.data.coreWorkflowVersionsByCoreWorkflowId;

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
        label: 'v1',
        status: 'DRAFT',
        updatedAt: expect.any(String),
      }),
    );
  });
});
