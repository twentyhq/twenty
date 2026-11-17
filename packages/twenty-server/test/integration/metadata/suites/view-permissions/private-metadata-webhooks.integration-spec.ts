import { randomUUID } from 'node:crypto';

import { VIEW_CHILD_METADATA_NAMES } from 'src/engine/metadata-modules/view/constants/view-child-metadata-names.constant';
import { buildCreatedMetadataEventBatch } from 'test/integration/metadata/suites/utils/build-created-metadata-event-batch.util';
import { collectMetadataWebhookRecordIds } from 'test/integration/metadata/suites/utils/collect-metadata-webhook-record-ids.util';
import {
  createWebhook,
  deleteWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';
import { createOneViewOnObject } from 'test/integration/metadata/suites/view/utils/create-one-view-on-object.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';

describe('private metadata webhooks (integration)', () => {
  let unlistedViewId: string;
  let workspaceViewId: string;
  let webhookId: string;

  const findSentRecordIds = (
    batchInput: Parameters<typeof buildCreatedMetadataEventBatch>[0],
  ) =>
    collectMetadataWebhookRecordIds({
      metadataEventBatch: buildCreatedMetadataEventBatch(batchInput),
      webhookId,
    });

  beforeAll(async () => {
    unlistedViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Guest private webhook companies',
        visibility: ViewVisibility.UNLISTED,
      },
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    });
    workspaceViewId = await createOneViewOnObject({
      objectNameSingular: 'company',
      input: {
        name: 'Workspace webhook companies',
        visibility: ViewVisibility.WORKSPACE,
      },
    });

    const response = await createWebhook({
      input: {
        targetUrl: 'https://example.com/webhook',
        operations: ['*.*'],
      },
    });

    expect(response.body.errors).toBeUndefined();
    webhookId = response.body.data.createWebhook.id;
  });

  afterAll(async () => {
    await deleteWebhook({ id: webhookId });

    for (const viewId of [unlistedViewId, workspaceViewId]) {
      await destroyOneView({ viewId });
    }
  });

  it('should only send a workspace view', async () => {
    expect(
      await findSentRecordIds({
        metadataName: 'view',
        record: { id: unlistedViewId, visibility: ViewVisibility.UNLISTED },
      }),
    ).toEqual([]);
    expect(
      await findSentRecordIds({
        metadataName: 'view',
        record: { id: workspaceViewId, visibility: ViewVisibility.WORKSPACE },
      }),
    ).toEqual([workspaceViewId]);
  });

  it.each(VIEW_CHILD_METADATA_NAMES)(
    'should only send a %s whose parent view is a workspace view',
    async (metadataName) => {
      const childOfWorkspaceViewId = randomUUID();

      expect(
        await findSentRecordIds({
          metadataName,
          record: { id: randomUUID(), viewId: unlistedViewId },
        }),
      ).toEqual([]);
      expect(
        await findSentRecordIds({
          metadataName,
          record: { id: randomUUID(), viewId: randomUUID() },
        }),
      ).toEqual([]);
      expect(
        await findSentRecordIds({
          metadataName,
          record: { id: childOfWorkspaceViewId, viewId: workspaceViewId },
        }),
      ).toEqual([childOfWorkspaceViewId]);
    },
  );

  it('should only send a workspace workflow', async () => {
    const workspaceWorkflowId = randomUUID();

    expect(
      await findSentRecordIds({
        metadataName: 'workflow',
        record: { id: randomUUID(), visibility: WorkflowVisibility.PRIVATE },
      }),
    ).toEqual([]);
    expect(
      await findSentRecordIds({
        metadataName: 'workflow',
        record: {
          id: workspaceWorkflowId,
          visibility: WorkflowVisibility.WORKSPACE,
        },
      }),
    ).toEqual([workspaceWorkflowId]);
  });

  it('should not send a workflow version whose workflow is missing', async () => {
    const versionWithoutWorkflowId = randomUUID();

    expect(
      await findSentRecordIds({
        metadataName: 'workflowVersion',
        record: { id: randomUUID(), coreWorkflowId: randomUUID() },
      }),
    ).toEqual([]);
    expect(
      await findSentRecordIds({
        metadataName: 'workflowVersion',
        record: { id: versionWithoutWorkflowId, coreWorkflowId: null },
      }),
    ).toEqual([versionWithoutWorkflowId]);
  });
});
