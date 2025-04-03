import { Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';

import { DbEventDTO } from 'src/engine/subscriptions/dtos/db-event.dto';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseGuards(WorkspaceAuthGuard)
export class SubscriptionsResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  @Subscription(() => DbEventDTO)
  onDbEvent() {
    return this.pubSub.asyncIterator('onDbEvent');
  }
}
