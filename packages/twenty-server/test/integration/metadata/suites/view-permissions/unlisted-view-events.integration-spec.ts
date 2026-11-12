import { randomUUID } from 'node:crypto';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  createWebhook,
  deleteWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';
import { createViewFilterGroupQueryFactory } from 'test/integration/metadata/suites/view-filter-group/utils/create-view-filter-group-query-factory.util';
import { createViewQueryFactory } from 'test/integration/metadata/suites/view/utils/create-view-query-factory.util';
import { destroyViewQueryFactory } from 'test/integration/metadata/suites/view/utils/destroy-view-query-factory.util';
import { updateViewQueryFactory } from 'test/integration/metadata/suites/view/utils/update-view-query-factory.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { type AllMetadataName } from 'twenty-shared/metadata';
import {
  ViewFilterGroupLogicalOperator,
  ViewType,
  ViewVisibility,
  WorkflowVisibility,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type CallWebhookJobsForMetadataJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs-for-metadata.job';
import { type CallMetadataWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';
import { type WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const buildCreatedEventBatch = ({
  metadataName,
  record,
}: {
  metadataName: AllMetadataName;
  record: { id: string } & Record<string, unknown>;
}) =>
  ({
    name: `metadata.${metadataName}.created`,
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    metadataName,
    type: 'created',
    events: [
      {
        type: 'created',
        metadataName,
        recordId: record.id,
        properties: { after: record },
      },
    ],
  }) as unknown as MetadataEventBatch;

describe('unlisted view events (integration)', () => {
  let publisher: MetadataEventPublisher;
  let emitter: MetadataEventEmitter;
  let broadcastSpy: jest.SpyInstance;
  let unlistedViewId: string;
  let workspaceViewId: string;
  let creatorUserWorkspaceId: string;
  let webhookId: string;

  const createView = async ({
    name,
    visibility,
    token,
  }: {
    name: string;
    visibility: ViewVisibility;
    token: string;
  }): Promise<string> => {
    const response = await makeMetadataApiRequest(
      createViewQueryFactory({
        gqlFields: 'id',
        input: {
          name,
          objectMetadataId: await findObjectMetadataIdByName('company'),
          icon: 'IconTable',
          type: ViewType.TABLE,
          visibility,
        },
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.createView.id;
  };

  const createViewFilterGroup = async ({
    viewId,
    token,
  }: {
    viewId: string;
    token: string;
  }): Promise<string> => {
    const response = await makeMetadataApiRequest(
      createViewFilterGroupQueryFactory({
        gqlFields: 'id',
        input: {
          viewId,
          logicalOperator: ViewFilterGroupLogicalOperator.AND,
          positionInViewFilterGroup: 0,
        },
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.createViewFilterGroup.id;
  };

  const renameView = async ({
    viewId,
    name,
    token,
  }: {
    viewId: string;
    name: string;
    token: string;
  }) => {
    const response = await makeMetadataApiRequest(
      updateViewQueryFactory({
        viewId,
        gqlFields: 'id',
        input: { id: viewId, name },
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();
  };

  const findBroadcastEvent = ({
    entityName,
    recordId,
  }: {
    entityName: string;
    recordId: string;
  }): WorkspaceBroadcastEvent | undefined =>
    broadcastSpy.mock.calls
      .flatMap(([{ events }]) => events as WorkspaceBroadcastEvent[])
      .find(
        (event) =>
          event.entityName === entityName && event.recordId === recordId,
      );

  const publishAndFindBroadcastEvent = async ({
    metadataName,
    record,
  }: {
    metadataName: AllMetadataName;
    record: { id: string } & Record<string, unknown>;
  }) => {
    await publisher.publish(buildCreatedEventBatch({ metadataName, record }));

    return findBroadcastEvent({
      entityName: metadataName,
      recordId: record.id,
    });
  };

  const handleAndCollectWebhookRecordIds = async ({
    metadataName,
    record,
  }: {
    metadataName: AllMetadataName;
    record: { id: string } & Record<string, unknown>;
  }): Promise<string[]> => {
    const addJob = jest
      .spyOn(
        global.app.get<MessageQueueService>(
          getQueueToken(MessageQueue.webhookQueue),
        ),
        'add',
      )
      .mockResolvedValue(undefined);

    await getAppProviderByClassName<CallWebhookJobsForMetadataJob>(
      'CallWebhookJobsForMetadataJob',
    ).handle(buildCreatedEventBatch({ metadataName, record }));

    const recordIds = addJob.mock.calls
      .flatMap(([, jobData]) => jobData as CallMetadataWebhookJobData[])
      .filter((jobData) => jobData.webhookId === webhookId)
      .map((jobData) => jobData.event.recordId);

    addJob.mockRestore();

    return recordIds;
  };

  beforeAll(async () => {
    publisher = getAppProviderByClassName('MetadataEventPublisher');
    emitter = getAppProviderByClassName('MetadataEventEmitter');

    unlistedViewId = await createView({
      name: 'Guest private event companies',
      visibility: ViewVisibility.UNLISTED,
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    });
    workspaceViewId = await createView({
      name: 'Workspace event companies',
      visibility: ViewVisibility.WORKSPACE,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    const [unlistedView] = await globalThis.testDataSource.query(
      `SELECT "createdByUserWorkspaceId" FROM core."view" WHERE id = $1`,
      [unlistedViewId],
    );

    jestExpectToBeDefined(unlistedView.createdByUserWorkspaceId);
    creatorUserWorkspaceId = unlistedView.createdByUserWorkspaceId;

    const webhookResponse = await createWebhook({
      input: {
        targetUrl: 'https://example.com/webhook',
        operations: ['*.*'],
      },
    });

    expect(webhookResponse.body.errors).toBeUndefined();
    webhookId = webhookResponse.body.data.createWebhook.id;

    await emitter.drain();
  });

  beforeEach(() => {
    broadcastSpy = jest
      .spyOn(
        getAppProviderByClassName<WorkspaceEventBroadcaster>(
          'WorkspaceEventBroadcaster',
        ),
        'broadcast',
      )
      .mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await emitter.drain();
    broadcastSpy.mockRestore();
  });

  afterAll(async () => {
    await deleteWebhook({ id: webhookId });

    for (const viewId of [unlistedViewId, workspaceViewId]) {
      await makeMetadataApiRequest(destroyViewQueryFactory({ viewId }));
    }

    await emitter.drain();
  });

  describe('broadcast recipients', () => {
    it('should send an unlisted view update to its creator only', async () => {
      await renameView({
        viewId: unlistedViewId,
        name: 'Guest renamed event companies',
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      });
      await emitter.drain();

      const event = findBroadcastEvent({
        entityName: 'view',
        recordId: unlistedViewId,
      });

      jestExpectToBeDefined(event);
      expect(event.recipientUserWorkspaceIds).toEqual([creatorUserWorkspaceId]);
    });

    it('should send a child of an unlisted view to the view creator only', async () => {
      const viewFilterGroupId = await createViewFilterGroup({
        viewId: unlistedViewId,
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      });

      await emitter.drain();

      const event = findBroadcastEvent({
        entityName: 'viewFilterGroup',
        recordId: viewFilterGroupId,
      });

      jestExpectToBeDefined(event);
      expect(event.recipientUserWorkspaceIds).toEqual([creatorUserWorkspaceId]);
    });

    it('should send a workspace view and its children to everyone', async () => {
      await renameView({
        viewId: workspaceViewId,
        name: 'Workspace renamed event companies',
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      const viewFilterGroupId = await createViewFilterGroup({
        viewId: workspaceViewId,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      await emitter.drain();

      const viewEvent = findBroadcastEvent({
        entityName: 'view',
        recordId: workspaceViewId,
      });
      const childEvent = findBroadcastEvent({
        entityName: 'viewFilterGroup',
        recordId: viewFilterGroupId,
      });

      jestExpectToBeDefined(viewEvent);
      jestExpectToBeDefined(childEvent);
      expect(viewEvent.recipientUserWorkspaceIds).toBeUndefined();
      expect(childEvent.recipientUserWorkspaceIds).toBeUndefined();
    });

    it('should send an unlisted view without a creator to nobody', async () => {
      const event = await publishAndFindBroadcastEvent({
        metadataName: 'view',
        record: {
          id: randomUUID(),
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: null,
        },
      });

      jestExpectToBeDefined(event);
      expect(event.recipientUserWorkspaceIds).toEqual([]);
    });

    it('should send a child whose parent view is missing to nobody', async () => {
      const event = await publishAndFindBroadcastEvent({
        metadataName: 'viewSort',
        record: { id: randomUUID(), viewId: randomUUID() },
      });

      jestExpectToBeDefined(event);
      expect(event.recipientUserWorkspaceIds).toEqual([]);
    });
  });

  describe('metadata webhooks', () => {
    it('should not send an unlisted view', async () => {
      expect(
        await handleAndCollectWebhookRecordIds({
          metadataName: 'view',
          record: {
            id: unlistedViewId,
            visibility: ViewVisibility.UNLISTED,
            createdByUserWorkspaceId: creatorUserWorkspaceId,
          },
        }),
      ).toEqual([]);
    });

    it('should send a workspace view', async () => {
      expect(
        await handleAndCollectWebhookRecordIds({
          metadataName: 'view',
          record: {
            id: workspaceViewId,
            visibility: ViewVisibility.WORKSPACE,
            createdByUserWorkspaceId: null,
          },
        }),
      ).toEqual([workspaceViewId]);
    });

    it.each([
      'viewField',
      'viewFieldGroup',
      'viewFilter',
      'viewFilterGroup',
      'viewGroup',
      'viewSort',
    ] as const)(
      'should only send a %s whose parent view is a workspace view',
      async (metadataName) => {
        const childOfUnlistedViewId = randomUUID();
        const childOfWorkspaceViewId = randomUUID();
        const childOfMissingViewId = randomUUID();

        expect(
          await handleAndCollectWebhookRecordIds({
            metadataName,
            record: { id: childOfUnlistedViewId, viewId: unlistedViewId },
          }),
        ).toEqual([]);
        expect(
          await handleAndCollectWebhookRecordIds({
            metadataName,
            record: { id: childOfMissingViewId, viewId: randomUUID() },
          }),
        ).toEqual([]);
        expect(
          await handleAndCollectWebhookRecordIds({
            metadataName,
            record: { id: childOfWorkspaceViewId, viewId: workspaceViewId },
          }),
        ).toEqual([childOfWorkspaceViewId]);
      },
    );

    it('should only send a workspace workflow', async () => {
      const privateWorkflowId = randomUUID();
      const workspaceWorkflowId = randomUUID();

      expect(
        await handleAndCollectWebhookRecordIds({
          metadataName: 'workflow',
          record: {
            id: privateWorkflowId,
            visibility: WorkflowVisibility.PRIVATE,
            createdByUserWorkspaceId: creatorUserWorkspaceId,
          },
        }),
      ).toEqual([]);
      expect(
        await handleAndCollectWebhookRecordIds({
          metadataName: 'workflow',
          record: {
            id: workspaceWorkflowId,
            visibility: WorkflowVisibility.WORKSPACE,
            createdByUserWorkspaceId: null,
          },
        }),
      ).toEqual([workspaceWorkflowId]);
    });

    it('should not send a workflow version whose workflow is missing', async () => {
      const versionOfMissingWorkflowId = randomUUID();
      const versionWithoutWorkflowId = randomUUID();

      expect(
        await handleAndCollectWebhookRecordIds({
          metadataName: 'workflowVersion',
          record: {
            id: versionOfMissingWorkflowId,
            coreWorkflowId: randomUUID(),
          },
        }),
      ).toEqual([]);
      expect(
        await handleAndCollectWebhookRecordIds({
          metadataName: 'workflowVersion',
          record: { id: versionWithoutWorkflowId, coreWorkflowId: null },
        }),
      ).toEqual([versionWithoutWorkflowId]);
    });
  });
});
