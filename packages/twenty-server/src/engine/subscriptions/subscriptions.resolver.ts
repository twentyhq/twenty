import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { isDefined } from 'twenty-shared/utils';

import { OnDbEventDTO } from 'src/engine/subscriptions/dtos/on-db-event.dto';
import { OnDbEventInput } from 'src/engine/subscriptions/dtos/on-db-event.input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class SubscriptionsResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  @Subscription(() => OnDbEventDTO, {
    filter: (
      payload: { onDbEvent: OnDbEventDTO },
      variables: { input: OnDbEventInput },
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
  onDbEvent(@Args('input') _: OnDbEventInput) {
    return this.pubSub.asyncIterator('onDbEvent');
  }
}
