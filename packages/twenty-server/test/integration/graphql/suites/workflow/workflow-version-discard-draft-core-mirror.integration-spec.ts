import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

describe('discard draft workflow version core mirror (e2e)', () => {
  let workflowId: string;
  let firstVersionId: string;
  let draftVersionId: string;

  const coreVersions = async (): Promise<{ id: string; status: string }[]> => {
    return global.testDataSource.query(
      `SELECT "id", "status" FROM core."workflowVersion"
       WHERE "workspaceId" = $1 AND "workflowId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, workflowId],
    );
  };

  beforeAll(async () => {
    const createResponse = await graphql(`
      mutation {
        createWorkflow(data: { name: "Discard Draft Mirror" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();
    workflowId = createResponse.body.data.createWorkflow.id;

    const getResponse = await graphql(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
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
      { id: workflowId },
    );

    firstVersionId = getResponse.body.data.workflow.versions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId: firstVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

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
          workflowVersionId: firstVersionId,
          stepType: 'FIND_RECORDS',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(stepResponse.body.errors).toBeUndefined();

    const activateResponse = await graphql(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId: firstVersionId },
    );

    expect(activateResponse.body.errors).toBeUndefined();

    const draftResponse = await graphql(
      `
        mutation CreateDraft($input: CreateDraftFromWorkflowVersionInput!) {
          createDraftFromWorkflowVersion(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          workflowId,
          workflowVersionIdToCopy: firstVersionId,
        },
      },
    );

    expect(draftResponse.body.errors).toBeUndefined();
    draftVersionId = draftResponse.body.data.createDraftFromWorkflowVersion.id;
  });

  afterAll(async () => {
    if (workflowId) {
      await graphql(
        `
          mutation DestroyWorkflow($id: ID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: workflowId },
      );
    }
  });

  it('removes only the discarded draft core row, keeping the active version', async () => {
    // the active version and the new draft are both mirrored to core
    const versionsBefore = await coreVersions();

    expect(versionsBefore.map((version) => version.status).sort()).toEqual([
      'ACTIVE',
      'DRAFT',
    ]);

    const activeCoreId = versionsBefore.find(
      (version) => version.status === 'ACTIVE',
    )?.id;
    const draftCoreId = versionsBefore.find(
      (version) => version.status === 'DRAFT',
    )?.id;

    expect(activeCoreId).toBeDefined();
    expect(draftCoreId).toBeDefined();

    const deleteResponse = await graphql(
      `
        mutation DeleteWorkflowVersion($id: ID!) {
          deleteWorkflowVersion(id: $id) {
            id
          }
        }
      `,
      { id: draftVersionId },
    );

    expect(deleteResponse.body.errors).toBeUndefined();

    const versionsAfter = await coreVersions();

    // only the discarded draft's core row is removed; the active row remains
    expect(versionsAfter).toHaveLength(1);
    expect(versionsAfter[0].id).toBe(activeCoreId);
    expect(versionsAfter[0].id).not.toBe(draftCoreId);
  });
});
