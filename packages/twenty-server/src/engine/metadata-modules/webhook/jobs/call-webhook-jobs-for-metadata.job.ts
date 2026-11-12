import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { VIEW_CHILD_METADATA_NAMES } from 'src/engine/metadata-modules/view/constants/view-child-metadata-names.constant';
import { isViewVisibleToUser } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-user.util';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { type CallMetadataWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { WebhookRateLimitService } from 'src/engine/metadata-modules/webhook/jobs/webhook-rate-limit.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WEBHOOK_JOBS_CHUNK_SIZE = 20;

type WebhookEventRecord = {
  visibility?: WorkflowVisibility | ViewVisibility | null;
  coreWorkflowId?: string | null;
  viewId?: string | null;
};

const getWebhookEventRecord = (event: MetadataEventBatch['events'][number]) =>
  (event.type === 'deleted'
    ? event.properties.before
    : event.properties.after) as WebhookEventRecord | undefined;

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsForMetadataJob {
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly webhookRateLimitService: WebhookRateLimitService,
  ) {}

  @Process(CallWebhookJobsForMetadataJob.name)
  async handle(metadataEventBatch: MetadataEventBatch): Promise<void> {
    const eventName = metadataEventBatch.name;
    const metadataName = metadataEventBatch.metadataName;
    const operation = metadataEventBatch.type;

    const operationsToMatch = [
      eventName,
      `metadata.${metadataName}.*`,
      `metadata.*.${operation}`,
      `metadata.*.*`,
      '*.*',
    ];

    const { flatWebhookMaps } = await this.workspaceCacheService.getOrRecompute(
      metadataEventBatch.workspaceId,
      ['flatWebhookMaps'],
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

    const workspaceVisibleEvents =
      await this.filterWorkspaceVisibleEvents(metadataEventBatch);

    if (workspaceVisibleEvents.length === 0) {
      return;
    }

    const webhookEvents = this.transformMetadataEventBatchToWebhookEvents({
      metadataEventBatch: {
        ...metadataEventBatch,
        events: workspaceVisibleEvents,
      },
      webhooks,
    });

    const admittedWebhookEvents =
      await this.webhookRateLimitService.admitWebhookEventsWithinRateLimit({
        workspaceId: metadataEventBatch.workspaceId,
        webhookEvents,
      });

    const webhookEventsChunks = chunk(
      admittedWebhookEvents,
      WEBHOOK_JOBS_CHUNK_SIZE,
    );

    for (const webhookEventsChunk of webhookEventsChunks) {
      await this.messageQueueService.add<CallMetadataWebhookJobData[]>(
        CallWebhookJob.name,
        webhookEventsChunk,
        {
          retryLimit: 3,
          workspaceId: metadataEventBatch.workspaceId,
          isWorkspaceJob: true,
        },
      );
    }
  }

  private async filterWorkspaceVisibleEvents({
    metadataName,
    workspaceId,
    events,
  }: MetadataEventBatch): Promise<MetadataEventBatch['events']> {
    if (metadataName === 'view') {
      return events.filter(
        (event) =>
          getWebhookEventRecord(event)?.visibility === ViewVisibility.WORKSPACE,
      );
    }

    if (VIEW_CHILD_METADATA_NAMES.includes(metadataName)) {
      const { flatViewMaps } = await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        ['flatViewMaps'],
      );

      return events.filter((event) => {
        const viewId = getWebhookEventRecord(event)?.viewId;

        const parentFlatView = isNonEmptyString(viewId)
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityMaps: flatViewMaps,
              flatEntityId: viewId,
            })
          : undefined;

        return (
          isDefined(parentFlatView) &&
          isViewVisibleToUser(parentFlatView, undefined)
        );
      });
    }

    if (metadataName === 'workflow') {
      return events.filter(
        (event) =>
          getWebhookEventRecord(event)?.visibility ===
          WorkflowVisibility.WORKSPACE,
      );
    }

    if (metadataName === 'workflowVersion') {
      const { flatWorkflowMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatWorkflowMaps',
        ]);

      return events.filter((event) => {
        const coreWorkflowId = getWebhookEventRecord(event)?.coreWorkflowId;

        if (!isNonEmptyString(coreWorkflowId)) {
          return true;
        }

        return (
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityMaps: flatWorkflowMaps,
            flatEntityId: coreWorkflowId,
          })?.visibility === WorkflowVisibility.WORKSPACE
        );
      });
    }

    return events;
  }

  private transformMetadataEventBatchToWebhookEvents({
    metadataEventBatch,
    webhooks,
  }: {
    metadataEventBatch: MetadataEventBatch;
    webhooks: FlatWebhook[];
  }): CallMetadataWebhookJobData[] {
    const result: CallMetadataWebhookJobData[] = [];

    for (const webhook of webhooks) {
      for (const event of metadataEventBatch.events) {
        result.push({
          targetUrl: webhook.targetUrl,
          eventName: metadataEventBatch.name,
          workspaceId: metadataEventBatch.workspaceId,
          webhookId: webhook.id,
          eventDate: new Date(),
          userId: metadataEventBatch.userId,
          apiKeyId: metadataEventBatch.apiKeyId,
          secret: webhook.secret,
          event,
        });
      }
    }

    return result;
  }
}
