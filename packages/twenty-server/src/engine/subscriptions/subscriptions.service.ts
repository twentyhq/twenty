import { Inject, Injectable } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';

import { type ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';

@Injectable()
export class SubscriptionsService {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  async publish(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    for (const eventData of workspaceEventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: workspaceEventBatch.name,
        event: eventData,
      });

      await this.pubSub.publish('onDbEvent', {
        onDbEvent: {
          action: operation,
          objectNameSingular: nameSingular,
          eventDate: new Date(),
          record,
          ...(updatedFields && { updatedFields }),
        },
      });
    }
  }
}
