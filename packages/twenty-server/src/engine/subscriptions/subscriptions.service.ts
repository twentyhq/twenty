import { Inject, Injectable } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';
import { ON_DB_EVENT_TRIGGER } from 'src/engine/subscriptions/constants/on-db-event-trigger';

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

      await this.pubSub.publish(ON_DB_EVENT_TRIGGER, {
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
