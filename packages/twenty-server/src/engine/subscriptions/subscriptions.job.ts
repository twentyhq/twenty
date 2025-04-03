import { Inject, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { RedisPubSub } from 'graphql-redis-subscriptions';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';

@Processor(MessageQueue.subscriptionsQueue)
export class SubscriptionsJob {
  private readonly logger = new Logger(SubscriptionsJob.name);
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  @Process(SubscriptionsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    for (const eventData of workspaceEventBatch.events) {
      const [objectNameSingular, operation] =
        workspaceEventBatch.name.split('.');
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

      await this.pubSub.publish('onDbEvent', {
        onDbEvent: {
          action: operation,
          objectNameSingular,
          record,
          ...(updatedFields && { updatedFields }),
        },
      });
    }
  }
}
