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
import { SubscriptionMatchesDTO } from 'src/engine/subscriptions/dtos/subscription-matches.dto';
import { SubscriptionInput } from 'src/engine/subscriptions/dtos/subscription.input';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class WorkspaceEventEmitterResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

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

  @Subscription(() => SubscriptionMatchesDTO, {
    nullable: true,
    resolve: async function (
      this: WorkspaceEventEmitterResolver,
      payload: { onDbEvents: OnDbEventDTO[] },
      args: { subscriptions: SubscriptionInput[] },
      context: { req: { workspace: { id: string } } },
    ): Promise<SubscriptionMatchesDTO> {
      const workspaceId = context.req.workspace.id;

      const matches: { subscriptionIds: string[]; event: OnDbEventDTO }[] = [];

      for (const event of payload.onDbEvents) {
        const matchedSubscriptionIds = await Promise.all(
          args.subscriptions.map(async (subscription) => {
            const isMatch =
              await this.subscriptionService.isSubscriptionMatchingEvent(
                subscription,
                event,
                workspaceId,
              );

            return isMatch ? subscription.id : null;
          }),
        );

        const filteredIds = matchedSubscriptionIds.filter(
          (id): id is string => id !== null,
        );

        if (filteredIds.length > 0) {
          matches.push({
            subscriptionIds: filteredIds,
            event,
          });
        }
      }

      return { matches };
    },
  })
  onSubscriptionMatch(
    @Args('subscriptions', { type: () => [SubscriptionInput] })
    _: SubscriptionInput[],
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.DATABASE_BATCH_EVENTS_CHANNEL,
      workspaceId: workspace.id,
    });
  }
}
