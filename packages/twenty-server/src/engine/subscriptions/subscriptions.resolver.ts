import { Resolver, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';

import { DbEventDTO } from 'src/engine/subscriptions/dtos/db-event.dto';

@Resolver()
export class SubscriptionsResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  @Subscription(() => DbEventDTO)
  onDbEvent() {
    return this.pubSub.asyncIterator('onDbEvent');
  }
}
