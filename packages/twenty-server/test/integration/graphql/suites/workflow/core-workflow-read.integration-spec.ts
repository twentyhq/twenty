import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 250;

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

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

describe('coreWorkflow (e2e)', () => {
  let workspaceWorkflowId: string;

  beforeAll(async () => {
    const createResponse = await graphql(`
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

  it('should read one workflow by its workspace id', async () => {
    let coreWorkflow;

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const response = await graphql(CORE_WORKFLOW_QUERY, {
        workspaceWorkflowId,
      });

      expect(response.body.errors).toBeUndefined();

      coreWorkflow = response.body.data.coreWorkflow;

      if (isDefined(coreWorkflow)) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    expect(coreWorkflow).not.toBeNull();
    expect(coreWorkflow).toBeDefined();
    expect(coreWorkflow.name).toBe('Core Workflow Read');
    expect(coreWorkflow.workspaceWorkflowId).toBe(workspaceWorkflowId);
    expect(coreWorkflow.statuses).toEqual(['DRAFT']);
    expect(coreWorkflow.lastPublishedVersionId).toBeNull();
  });

  it('should return null for a workflow that does not exist', async () => {
    const response = await graphql(CORE_WORKFLOW_QUERY, {
      workspaceWorkflowId: '00000000-0000-4000-8000-000000000000',
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflow).toBeNull();
  });

  it('should expose the version content the show page renders', async () => {
    const versionsQuery = `
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

    let versions = [];

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const versionsResponse = await graphql(versionsQuery, {
        workspaceWorkflowId,
      });

      expect(versionsResponse.body.errors).toBeUndefined();

      versions = versionsResponse.body.data.coreWorkflowVersions;

      if (
        versions.length === 1 &&
        isDefined(versions[0].workspaceWorkflowVersionId)
      ) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    expect(versions).toHaveLength(1);
    expect(versions[0].workspaceWorkflowVersionId).not.toBeNull();
    expect(versions[0].status).toBe('DRAFT');
    expect(versions[0].updatedAt).toBeDefined();

    const versionResponse = await graphql(
      `
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
      `,
      {
        workspaceWorkflowVersionId: versions[0].workspaceWorkflowVersionId,
      },
    );

    expect(versionResponse.body.errors).toBeUndefined();
    expect(
      versionResponse.body.data.coreWorkflowVersion.workspaceWorkflowVersionId,
    ).toBe(versions[0].workspaceWorkflowVersionId);
    expect(
      versionResponse.body.data.coreWorkflowVersion.updatedAt,
    ).toBeDefined();
  });
});
