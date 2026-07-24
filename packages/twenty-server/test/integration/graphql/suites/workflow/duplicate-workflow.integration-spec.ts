import request from 'supertest';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

describe('duplicateWorkflow (e2e)', () => {
  let sourceWorkflowId: string;
  let sourceVersionId: string;
  let duplicatedWorkflowId: string | undefined;

  beforeAll(async () => {
    const createResponse = await graphql(`
      mutation {
        createWorkflow(data: { name: "Duplicate Source" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();
    sourceWorkflowId = createResponse.body.data.createWorkflow.id;

    const getResponse = await graphql(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
            id
            versions {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `,
      { id: sourceWorkflowId },
    );

    sourceVersionId = getResponse.body.data.workflow.versions.edges[0].node.id;

    await graphql(
      `
        mutation UpdateWorkflowVersion(
          $id: UUID!
          $data: WorkflowVersionUpdateInput!
        ) {
          updateWorkflowVersion(id: $id, data: $data) {
            id
          }
        }
      `,
      {
        id: sourceVersionId,
        data: {
          trigger: {
            name: 'Manual Trigger',
            type: 'MANUAL',
            settings: { outputSchema: {} },
            nextStepIds: [],
            position: { x: 0, y: 0 },
          },
        },
      },
    );

    const stepResponse = await graphql(
      `
        mutation CreateWorkflowVersionStep(
          $input: CreateWorkflowVersionStepInput!
        ) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId: sourceVersionId,
          stepType: 'FIND_RECORDS',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(stepResponse.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    for (const id of [duplicatedWorkflowId, sourceWorkflowId]) {
      if (id) {
        await graphql(
          `
            mutation DestroyWorkflow($id: ID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          { id },
        );
      }
    }
  });

  it('duplicates the workflow and mirrors the new draft version to core', async () => {
    const response = await graphql(
      `
        mutation DuplicateWorkflow($input: DuplicateWorkflowInput!) {
          duplicateWorkflow(input: $input) {
            id
            workflowId
            status
            trigger
            steps
          }
        }
      `,
      {
        input: {
          workflowIdToDuplicate: sourceWorkflowId,
          workflowVersionIdToCopy: sourceVersionId,
        },
      },
    );

    expect(response.body.errors).toBeUndefined();

    const duplicated = response.body.data.duplicateWorkflow;

    duplicatedWorkflowId = duplicated?.workflowId;

    expect(duplicated.id).not.toBe(sourceVersionId);
    expect(duplicated.workflowId).not.toBe(sourceWorkflowId);
    expect(duplicated.status).toBe('DRAFT');
    expect(duplicated.trigger?.type).toBe('MANUAL');
    expect(Array.isArray(duplicated.steps)).toBe(true);
    expect(duplicated.steps.length).toBeGreaterThan(0);

    const coreRows = await global.testDataSource.query(
      `SELECT "id", "steps", "triggers", "status" FROM core."workflowVersion"
       WHERE "workspaceId" = $1 AND "workflowId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, duplicated.workflowId],
    );

    expect(coreRows).toHaveLength(1);
    expect(coreRows[0].status).toBe('DRAFT');
    expect(Array.isArray(coreRows[0].steps)).toBe(true);
    expect(coreRows[0].steps.length).toBe(duplicated.steps.length);
    expect(Array.isArray(coreRows[0].triggers)).toBe(true);
    expect(coreRows[0].triggers[0].type).toBe('MANUAL');
  });
});
