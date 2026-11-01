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
import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import { RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
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
    private readonly webhookRateLimitService: WebhookRateLimitService,
  ) {}

  @Process(CallWebhookJobsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatchForWebhook<ObjectRecordEvent>,
  ): Promise<void> {
    // Keep in sync with packages/twenty-zapier/src/triggers/trigger_record.ts and computeWebhooks.utils.ts

    const { flatWebhookMaps, flatObjectMetadataMaps, flatRoleTargetMaps } =
      await this.workspaceCacheService.getOrRecompute(
        workspaceEventBatch.workspaceId,
        ['flatWebhookMaps', 'flatObjectMetadataMaps', 'flatRoleTargetMaps'],
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

    if (!isDefined(flatObjectMetadata)) {
      this.logger.warn(
        `Object metadata ${workspaceEventBatch.objectMetadata.id} not found for workspace ${workspaceEventBatch.workspaceId}, dropping the webhook batch`,
      );

      return;
    }

    const eventRecordAccessGate =
      this.recordAccessPolicyService.buildEventRecordAccessGate({
        ...workspaceEventBatch,
        objectMetadata: flatObjectMetadata,
      });
    const webhookEvents: CallWebhookJobData[] = [];

    for (const webhook of webhooks) {
      const webhookRoleId = findFlatRoleTargetFromForeignKey({
        flatRoleTargetMaps,
        targetMetadataForeignKey: 'webhookId',
        targetId: webhook.id,
      })?.roleId;

      if (!isDefined(webhookRoleId)) {
        this.logger.warn(
          `Webhook ${webhook.id} has no role in workspace ${workspaceEventBatch.workspaceId}, skipping its events`,
        );

        continue;
      }

      webhookEvents.push(
        ...transformEventBatchToWebhookEvents({
          workspaceEventBatch,
          webhooks: [webhook],
          admittedRecordIds:
            await eventRecordAccessGate.resolveAdmittedRecordIds({
              workspaceId: workspaceEventBatch.workspaceId,
              intersectionOf: { webhookRoleId },
            }),
        }),
      );
    }

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
        {
          retryLimit: 3,
          workspaceId: workspaceEventBatch.workspaceId,
          isWorkspaceJob: true,
        },
      );
    }
  }
}
