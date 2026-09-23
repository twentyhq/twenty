import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

describe('workflow version core mirror metadata events (e2e)', () => {
  let emitMetadataEventsSpy: jest.SpyInstance;
  let workflowId: string;
  let workflowVersionId: string;

  const findCoreWorkflowVersion = async (): Promise<{
    id: string;
    updatedAt: Date;
  }> => {
    const [coreWorkflowVersion] = await global.testDataSource.query(
      `SELECT "id", "updatedAt" FROM core."workflowVersion"
       WHERE "workspaceId" = $1 AND "workspaceWorkflowVersionId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, workflowVersionId],
    );

    return coreWorkflowVersion;
  };

  beforeAll(async () => {
    emitMetadataEventsSpy = jest.spyOn(
      getAppProviderByClassName<MetadataEventEmitter>('MetadataEventEmitter'),
      'emitMetadataEvents',
    );

    const createResponse = await graphql(`
      mutation {
        createWorkflow(data: { name: "Core Mirror Metadata Events" }) {
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

    workflowVersionId =
      getResponse.body.data.workflow.versions.edges[0].node.id;
  });

  afterAll(async () => {
    emitMetadataEventsSpy.mockRestore();

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

  it('emits a workflowVersion update and bumps updatedAt when a workspace mutation writes the core mirror', async () => {
    const coreWorkflowVersionBeforeWrite = await findCoreWorkflowVersion();

    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const coreWorkflowVersionAfterWrite = await findCoreWorkflowVersion();

    expect(
      new Date(coreWorkflowVersionAfterWrite.updatedAt).getTime(),
    ).toBeGreaterThan(
      new Date(coreWorkflowVersionBeforeWrite.updatedAt).getTime(),
    );

    expect(
      emitMetadataEventsSpy.mock.calls.flatMap(
        ([{ metadataEvents }]) => metadataEvents,
      ),
    ).toContainEqual(
      expect.objectContaining({
        type: 'updated',
        metadataName: 'workflowVersion',
        recordId: coreWorkflowVersionBeforeWrite.id,
        properties: expect.objectContaining({
          updatedFields: expect.arrayContaining(['triggers']),
        }),
      }),
    );
  });
});
