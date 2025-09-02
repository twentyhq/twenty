import { Inject, Injectable } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { removeSecretFromWebhookRecord } from 'src/utils/remove-secret-from-webhook-record';

@Injectable()
export class SubscriptionsService {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  async publish(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    for (const eventData of workspaceEventBatch.events) {
      const [nameSingular, operation] = workspaceEventBatch.name.split('.');
      const record =
        'after' in eventData.properties && isDefined(eventData.properties.after)
          ? eventData.properties.after
          : 'before' in eventData.properties &&
              isDefined(eventData.properties.before)
            ? eventData.properties.before
            : {};
      const updatedFields =
        'updatedFields' in eventData.properties
          ? eventData.properties.updatedFields
          : undefined;

      const isWebhookEvent = nameSingular === 'webhook';
      const sanitizedRecord = removeSecretFromWebhookRecord(
        record,
        isWebhookEvent,
      );

      await this.pubSub.publish('onDbEvent', {
        onDbEvent: {
          action: operation,
          objectNameSingular: nameSingular,
          eventDate: new Date(),
          record: sanitizedRecord,
          ...(updatedFields && { updatedFields }),
        },
      });
    }
  }
}
