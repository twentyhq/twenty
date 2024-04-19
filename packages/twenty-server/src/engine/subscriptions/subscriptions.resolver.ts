import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Resolver, Subscription } from '@nestjs/graphql';

import { PubSub } from 'graphql-subscriptions';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';

@Resolver()
export class SubscriptionsResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Subscription(() => ObjectRecordCreateEvent<any>)
  created() {
    return this.pubSub.asyncIterator('created');
  }

  @Subscription(() => ObjectRecordUpdateEvent<any>)
  updated() {
    return this.pubSub.asyncIterator('updated');
  }

  @Subscription(() => ObjectRecordDeleteEvent<any>)
  deleted() {
    return this.pubSub.asyncIterator('deleted');
  }
}
