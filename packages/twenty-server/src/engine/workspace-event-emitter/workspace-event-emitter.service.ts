import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';

@Injectable()
export class WorkspaceEventEmitterService {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async publish(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    for (const eventData of workspaceEventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: workspaceEventBatch.name,
        event: eventData,
      });

      await this.subscriptionService.publish({
        channel: SubscriptionChannel.DATABASE_EVENT_CHANNEL,
        workspaceId: workspaceEventBatch.workspaceId,
        payload: {
          onDbEvent: {
            action: operation,
            objectNameSingular: nameSingular,
            eventDate: new Date(),
            record,
            ...(updatedFields && { updatedFields }),
          },
        },
      });
    }
  }
}
