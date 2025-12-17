import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Resolver, Subscription } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { OnDbEventDTO } from 'src/engine/subscriptions/dtos/on-db-event.dto';
import { OnDbEventInput } from 'src/engine/subscriptions/dtos/on-db-event.input';
import { QuerySubscriptionInput } from 'src/engine/subscriptions/dtos/query-subscription.input';
import { RefetchSignalDTO } from 'src/engine/subscriptions/dtos/refetch-signal.dto';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionsService } from 'src/engine/subscriptions/services/subscriptions.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class SubscriptionsResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

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
  onDbEvent(
    @Args('input') _: OnDbEventInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.DATABASE_EVENT_CHANNEL,
      workspaceId: workspace.id,
    });
  }

  @Subscription(() => RefetchSignalDTO, {
    nullable: true,
    resolve: async function (
      this: SubscriptionsResolver,
      payload: { onDbEvent: OnDbEventDTO },
      args: { subscriptions: QuerySubscriptionInput[] },
      context: { req: { workspace: { id: string } } },
    ): Promise<RefetchSignalDTO | null> {
      const workspaceId = context.req.workspace.id;

      const matchedSubscriptionIds = await Promise.all(
        args.subscriptions.map(async (subscription) => {
          const matches = await this.subscriptionsService.isQueryMatchingEvent(
            subscription.query,
            payload.onDbEvent,
            workspaceId,
          );

          return matches ? subscription.id : null;
        }),
      );

      const filteredIds = matchedSubscriptionIds.filter(
        (id): id is string => id !== null,
      );

      if (filteredIds.length === 0) {
        return null;
      }

      return {
        subscriptionIds: filteredIds,
      };
    },
  })
  onRefetchSignal(
    @Args('subscriptions', { type: () => [QuerySubscriptionInput] })
    _: QuerySubscriptionInput[],
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.DATABASE_EVENT_CHANNEL,
      workspaceId: workspace.id,
    });
  }
}
