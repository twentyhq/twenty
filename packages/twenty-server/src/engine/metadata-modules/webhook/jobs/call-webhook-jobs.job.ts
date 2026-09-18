import { Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { WebhookRateLimitService } from 'src/engine/metadata-modules/webhook/jobs/webhook-rate-limit.service';
import { type CallWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { type WorkspaceEventBatchForWebhook } from 'src/engine/metadata-modules/webhook/types/workspace-event-batch-for-webhook.type';
import { findWebhooksMatchingEventName } from 'src/engine/metadata-modules/webhook/utils/find-webhooks-matching-event-name.util';
import { transformEventBatchToWebhookEvents } from 'src/engine/metadata-modules/webhook/utils/transform-event-batch-to-webhook-events';
import { EVERYONE_ROW_ACCESS_POLICY_SUBJECT } from 'src/engine/core-modules/record-share/constants/everyone-row-access-policy-subject.constant';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WEBHOOK_JOBS_CHUNK_SIZE = 20;

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsJob {
  private readonly logger = new Logger(CallWebhookJobsJob.name);
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
    private readonly recordSharingFeatureService: RecordSharingFeatureService,
    private readonly webhookRateLimitService: WebhookRateLimitService,
  ) {}

  @Process(CallWebhookJobsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatchForWebhook<ObjectRecordEvent>,
  ): Promise<void> {
    // If you change that function, double check it does not break Zapier
    // trigger in packages/twenty-zapier/src/triggers/trigger_record.ts
    // Also change the openApi schema for webhooks
    // packages/twenty-server/src/engine/core-modules/open-api/utils/computeWebhooks.utils.ts

    const { flatWebhookMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(
        workspaceEventBatch.workspaceId,
        ['flatWebhookMaps', 'flatObjectMetadataMaps'],
      );

    const webhooks = findWebhooksMatchingEventName({
      flatWebhookMaps,
      eventName: workspaceEventBatch.name,
    });

    if (webhooks.length === 0) {
      return;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: workspaceEventBatch.objectMetadata.id,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const isRecordSharingEnabled =
      await this.recordSharingFeatureService.isRecordSharingEnabled(
        workspaceEventBatch.workspaceId,
      );

    // Without the readability the batch cannot be gated, so nothing may leave
    if (isRecordSharingEnabled && !isDefined(flatObjectMetadata)) {
      this.logger.warn(
        `Object metadata ${workspaceEventBatch.objectMetadata.id} not found for workspace ${workspaceEventBatch.workspaceId}, dropping the webhook batch`,
      );

      return;
    }

    // A webhook carries no identity, so only a row granted to everyone lets an event out
    const admittedRecordIds = isDefined(flatObjectMetadata)
      ? await this.recordAccessPolicyService
          .buildEventRecordAccessGate({
            ...workspaceEventBatch,
            objectMetadata: flatObjectMetadata,
          })
          .resolveAdmittedRecordIds(EVERYONE_ROW_ACCESS_POLICY_SUBJECT)
      : undefined;

    const webhookEvents = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
      admittedRecordIds,
    });

    const admittedWebhookEvents =
      await this.webhookRateLimitService.admitWebhookEventsWithinRateLimit({
        workspaceId: workspaceEventBatch.workspaceId,
        webhookEvents,
      });

    const webhookEventsChunks = chunk(
      admittedWebhookEvents,
      WEBHOOK_JOBS_CHUNK_SIZE,
    );

    for (const webhookEventsChunk of webhookEventsChunks) {
      await this.messageQueueService.add<CallWebhookJobData[]>(
        CallWebhookJob.name,
        webhookEventsChunk,
        { retryLimit: 3 },
      );
    }
  }
}
