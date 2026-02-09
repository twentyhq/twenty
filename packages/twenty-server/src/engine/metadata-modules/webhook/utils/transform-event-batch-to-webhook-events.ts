import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { type CallWebhookJobData } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { transformEventToWebhookEvent } from 'src/engine/metadata-modules/webhook/utils/transform-event-to-webhook-event';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const transformEventBatchToWebhookEvents = ({
  workspaceEventBatch,
  webhooks,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  webhooks: Pick<WebhookEntity, 'id' | 'targetUrl' | 'secret'>[];
}): CallWebhookJobData[] => {
  const result: CallWebhookJobData[] = [];

  for (const webhook of webhooks) {
    const targetUrl = webhook.targetUrl;
    const eventName = workspaceEventBatch.name;
    const objectMetadataForWebhook = {
      id: workspaceEventBatch.objectMetadata.id,
      nameSingular: workspaceEventBatch.objectMetadata.nameSingular,
    };
    const workspaceId = workspaceEventBatch.workspaceId;
    const webhookId = webhook.id;
    const eventDate = new Date();
    const secret = webhook.secret;

    for (const eventData of workspaceEventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: workspaceEventBatch.name,
        event: eventData,
      });

      result.push({
        targetUrl,
        eventName,
        objectMetadata: objectMetadataForWebhook,
        workspaceId,
        webhookId,
        eventDate,
        userId: eventData.userId,
        workspaceMemberId: eventData.workspaceMemberId,
        record,
        ...(updatedFields && { updatedFields }),
        secret,
      });
    }
  }

  return result;
};
