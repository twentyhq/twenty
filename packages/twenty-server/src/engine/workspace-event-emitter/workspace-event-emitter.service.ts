import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class WorkspaceEventEmitterService {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async publish(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    const batchEvents = [];

    for (const eventData of workspaceEventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: workspaceEventBatch.name,
        event: eventData,
      });

      const event = {
        action: operation,
        objectNameSingular: nameSingular,
        eventDate: new Date(),
        record,
        ...(updatedFields && { updatedFields }),
      };

      batchEvents.push(event);

      // Publish individual events to legacy channel (onDbEvent)
      await this.subscriptionService.publish({
        channel: SubscriptionChannel.DATABASE_EVENT_CHANNEL,
        workspaceId: workspaceEventBatch.workspaceId,
        payload: { onDbEvent: event },
      });
    }

    await this.subscriptionService.publish({
      channel: SubscriptionChannel.DATABASE_BATCH_EVENTS_CHANNEL,
      workspaceId: workspaceEventBatch.workspaceId,
      payload: { onDbEvents: batchEvents },
    });
  }
}
