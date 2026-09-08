import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { type CallWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { type WorkspaceEventBatchForWebhook } from 'src/engine/metadata-modules/webhook/types/workspace-event-batch-for-webhook.type';
import { transformEventToWebhookEvent } from 'src/engine/metadata-modules/webhook/utils/transform-event-to-webhook-event';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/twenty-orm/repository/resolve-required-record-share-access-levels.util';

export const transformEventBatchToWebhookEvents = ({
  workspaceEventBatch,
  webhooks,
  recordShares,
}: {
  workspaceEventBatch: WorkspaceEventBatchForWebhook<ObjectRecordEvent>;
  webhooks: Pick<WebhookEntity, 'id' | 'targetUrl' | 'secret'>[];
  recordShares?: RecordShare[];
}): CallWebhookJobData[] => {
  const result: CallWebhookJobData[] = [];

  const events = isDefined(recordShares)
    ? workspaceEventBatch.events.filter((event) =>
        isRecordSharedWithPrincipals({
          recordShares,
          recordId: event.recordId,
          principalIds: [EVERYONE_PRINCIPAL_ID],
          accessLevels: resolveRequiredRecordShareAccessLevels('select'),
        }),
      )
    : workspaceEventBatch.events;

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

    for (const eventData of events) {
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
