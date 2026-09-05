import { Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { FeatureFlagKey, type MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getEffectiveReadability } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-readability.util';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { type CallWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { type WorkspaceEventBatchForWebhook } from 'src/engine/metadata-modules/webhook/types/workspace-event-batch-for-webhook.type';
import { transformEventBatchToWebhookEvents } from 'src/engine/metadata-modules/webhook/utils/transform-event-batch-to-webhook-events';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WEBHOOK_JOBS_CHUNK_SIZE = 20;

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsJob {
  private readonly logger = new Logger(CallWebhookJobsJob.name);
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareService: RecordShareService,
  ) {}

  @Process(CallWebhookJobsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatchForWebhook<ObjectRecordEvent>,
  ): Promise<void> {
    // If you change that function, double check it does not break Zapier
    // trigger in packages/twenty-zapier/src/triggers/trigger_record.ts
    // Also change the openApi schema for webhooks
    // packages/twenty-server/src/engine/core-modules/open-api/utils/computeWebhooks.utils.ts

    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    const operationsToMatch = [
      `${nameSingular}.${operation}`,
      `*.${operation}`,
      `${nameSingular}.*`,
      '*.*',
    ];

    const { flatWebhookMaps, flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        workspaceEventBatch.workspaceId,
        ['flatWebhookMaps', 'flatObjectMetadataMaps', 'featureFlagsMap'],
      );

    const webhooks = Object.values(flatWebhookMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((webhook) =>
        operationsToMatch.some((operationToMatch) =>
          webhook.operations.includes(operationToMatch),
        ),
      );

    if (webhooks.length === 0) {
      return;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: workspaceEventBatch.objectMetadata.id,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const recordShares =
      featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] &&
      isDefined(flatObjectMetadata)
        ? await this.fetchRecordShares({
            workspaceEventBatch,
            readability: getEffectiveReadability(flatObjectMetadata),
          })
        : undefined;

    const webhookEvents = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
      recordShares,
    });

    const webhookEventsChunks = chunk(webhookEvents, WEBHOOK_JOBS_CHUNK_SIZE);

    for (const webhookEventsChunk of webhookEventsChunks) {
      await this.messageQueueService.add<CallWebhookJobData[]>(
        CallWebhookJob.name,
        webhookEventsChunk,
        { retryLimit: 3 },
      );
    }
  }

  private async fetchRecordShares({
    workspaceEventBatch,
    readability,
  }: {
    workspaceEventBatch: WorkspaceEventBatchForWebhook<ObjectRecordEvent>;
    readability: MetadataReadability;
  }): Promise<RecordShare[] | undefined> {
    const gateKind = resolveRecordShareGateKind({
      readability,
      isOwningApplication: false,
    });

    switch (gateKind) {
      case 'open':
        return undefined;
      case 'deny':
        return [];
      case 'private':
        return this.recordShareService.findByRecordIds({
          workspaceId: workspaceEventBatch.workspaceId,
          objectMetadataId: workspaceEventBatch.objectMetadata.id,
          recordIds: workspaceEventBatch.events.map((event) => event.recordId),
        });
      default:
        assertUnreachable(gateKind);
    }
  }
}
