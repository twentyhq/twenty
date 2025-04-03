import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { isDefined } from 'twenty-shared/utils';

import { DbEventSubscriptionDTO } from 'src/engine/subscriptions/dtos/db-event-subscription.dto';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DbEventSubscriptionInput } from 'src/engine/subscriptions/dtos/db-event-subscription.input';

@Resolver()
@UseGuards(WorkspaceAuthGuard)
export class SubscriptionsResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  @Subscription(() => DbEventSubscriptionDTO, {
    filter: (
      payload: { onDbEvent: DbEventSubscriptionDTO },
      variables: { input: DbEventSubscriptionInput },
    ) => {
      const isActionMatching =
        !isDefined(variables.input.action) ||
        payload.onDbEvent.action === variables.input.action;

      const isObjectNameSingularMatching =
        !isDefined(variables.input.objectNameSingular) ||
        payload.onDbEvent.objectNameSingular ===
          variables.input.objectNameSingular;

      const isRecordIdMatching =
        !isDefined(variables.input.recordId) ||
        payload.onDbEvent.record.id === variables.input.recordId;

      return (
        isActionMatching && isObjectNameSingularMatching && isRecordIdMatching
      );
    },
  })
  onDbEvent(@Args('input') _: DbEventSubscriptionInput) {
    return this.pubSub.asyncIterator('onDbEvent');
  }
}
