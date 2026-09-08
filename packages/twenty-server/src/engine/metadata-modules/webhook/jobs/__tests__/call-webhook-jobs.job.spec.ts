import { FeatureFlagKey, MetadataReadability } from 'twenty-shared/types';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { type WorkspaceEventBatchForWebhook } from 'src/engine/metadata-modules/webhook/types/workspace-event-batch-for-webhook.type';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000002';
const WEBHOOK_ID = '20202020-0000-4000-8000-000000000003';

const workspaceEventBatch: WorkspaceEventBatchForWebhook<ObjectRecordEvent> = {
  name: 'contract.created',
  workspaceId: WORKSPACE_ID,
  objectMetadata: { id: OBJECT_METADATA_ID, nameSingular: 'contract' },
  events: [
    {
      recordId: 'record-1',
      properties: { after: { id: 'record-1', name: 'first' } },
    },
  ],
};

const buildCache = ({
  isRecordSharingEnabled,
  isObjectMetadataKnown,
}: {
  isRecordSharingEnabled: boolean;
  isObjectMetadataKnown: boolean;
}) => ({
  flatWebhookMaps: {
    byUniversalIdentifier: {
      [WEBHOOK_ID]: {
        id: WEBHOOK_ID,
        targetUrl: 'https://example.com/hook',
        secret: 'secret',
        operations: ['*.*'],
      },
    },
  },
  flatObjectMetadataMaps: isObjectMetadataKnown
    ? {
        universalIdentifierById: { [OBJECT_METADATA_ID]: OBJECT_METADATA_ID },
        byUniversalIdentifier: {
          [OBJECT_METADATA_ID]: {
            id: OBJECT_METADATA_ID,
            nameSingular: 'contract',
            readability: MetadataReadability.PRIVATE,
          },
        },
      }
    : { universalIdentifierById: {}, byUniversalIdentifier: {} },
  featureFlagsMap: {
    [FeatureFlagKey.IS_RECORD_SHARING_ENABLED]: isRecordSharingEnabled,
  },
});

describe('CallWebhookJobsJob', () => {
  let job: CallWebhookJobsJob;
  let messageQueueService: jest.Mocked<Pick<MessageQueueService, 'add'>>;
  let workspaceCacheService: jest.Mocked<
    Pick<WorkspaceCacheService, 'getOrRecompute'>
  >;
  let recordShareService: jest.Mocked<
    Pick<RecordShareService, 'findByRecordIds'>
  >;

  beforeEach(() => {
    messageQueueService = { add: jest.fn() };
    workspaceCacheService = { getOrRecompute: jest.fn() };
    recordShareService = { findByRecordIds: jest.fn().mockResolvedValue([]) };

    job = new CallWebhookJobsJob(
      messageQueueService as unknown as MessageQueueService,
      workspaceCacheService as unknown as WorkspaceCacheService,
      recordShareService as unknown as RecordShareService,
    );
  });

  it('should drop the batch when record sharing is enabled and the object metadata is gone', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      buildCache({
        isRecordSharingEnabled: true,
        isObjectMetadataKnown: false,
      }) as never,
    );

    await job.handle(workspaceEventBatch);

    expect(recordShareService.findByRecordIds).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should send the batch unfiltered when record sharing is disabled and the object metadata is gone', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      buildCache({
        isRecordSharingEnabled: false,
        isObjectMetadataKnown: false,
      }) as never,
    );

    await job.handle(workspaceEventBatch);

    expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    expect(messageQueueService.add.mock.calls[0][1]).toHaveLength(1);
  });

  it('should drop the events of a private object that are not shared with everyone', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      buildCache({
        isRecordSharingEnabled: true,
        isObjectMetadataKnown: true,
      }) as never,
    );

    await job.handle(workspaceEventBatch);

    expect(recordShareService.findByRecordIds).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      objectMetadataId: OBJECT_METADATA_ID,
      recordIds: ['record-1'],
    });
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
