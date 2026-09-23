import { type EventEmitter2 } from '@nestjs/event-emitter';
import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

describe('workflow version core mirror metadata events (e2e)', () => {
  let eventEmitter: EventEmitter2;
  let workflowId: string;
  let workflowVersionId: string;
  const recordedBatches: MetadataEventBatch[] = [];

  const recordBatch = (batch: MetadataEventBatch) => {
    recordedBatches.push(batch);
  };

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
    eventEmitter = getAppProviderByClassName<EventEmitter2>('EventEmitter2');
    eventEmitter.on('metadata.workflowVersion.updated', recordBatch);

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
    eventEmitter.off('metadata.workflowVersion.updated', recordBatch);

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

    expect(recordedBatches.flatMap((batch) => batch.events)).toContainEqual(
      expect.objectContaining({
        type: 'updated',
        recordId: coreWorkflowVersionBeforeWrite.id,
        properties: expect.objectContaining({
          updatedFields: expect.arrayContaining(['triggers']),
        }),
      }),
    );
  });
});
