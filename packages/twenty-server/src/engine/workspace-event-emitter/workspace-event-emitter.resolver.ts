import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AddQuerySubscriptionInput } from 'src/engine/subscriptions/dtos/add-query-subscription.input';
import { DbEventsRelatedToQueriesDTO } from 'src/engine/subscriptions/dtos/db-event-related-to-queries.dto';
import { OnDbEventDTO } from 'src/engine/subscriptions/dtos/on-db-event.dto';
import { OnDbEventInput } from 'src/engine/subscriptions/dtos/on-db-event.input';
import { RemoveQueryFromEventStreamInput } from 'src/engine/subscriptions/dtos/remove-query-subscription.input';
import { SubscriptionMatchesDTO } from 'src/engine/subscriptions/dtos/subscription-matches.dto';
import { SubscriptionInput } from 'src/engine/subscriptions/dtos/subscription.input';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class WorkspaceEventEmitterResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly eventStreamService: EventStreamService,
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

  @Mutation(() => Boolean)
  async addQueryToEventStream(
    @Args('input') input: AddQuerySubscriptionInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.eventStreamService.addQuery(
      workspace.id,
      input.eventStreamId,
      input.queryId,
      input.operationSignature,
    );

    return true;
  }

  @Mutation(() => Boolean)
  async removeQueryFromEventStream(
    @Args('input') input: RemoveQueryFromEventStreamInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.eventStreamService.removeQuery(
      workspace.id,
      input.eventStreamId,
      input.queryId,
    );

    return true;
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

  @Subscription(() => DbEventsRelatedToQueriesDTO, {
    nullable: true,
    resolve: async function (
      this: WorkspaceEventEmitterResolver,
      payload: { onDbEvents: OnDbEventDTO[] },
      args: { eventStreamId: string },
      context: { req: { workspace: { id: string } } },
    ): Promise<DbEventsRelatedToQueriesDTO> {
      const workspaceId = context.req.workspace.id;
      const { eventStreamId } = args;

      const queries = await this.eventStreamService.getQueries(
        workspaceId,
        eventStreamId,
      );

      const dbEventsWithRelatedQueryIds: {
        queryIds: string[];
        event: OnDbEventDTO;
      }[] = [];

      for (const event of payload.onDbEvents) {
        const matchedQueryIds =
          await this.eventStreamService.matchQueriesWithEvent(queries, event);

        if (matchedQueryIds.length > 0) {
          dbEventsWithRelatedQueryIds.push({
            queryIds: matchedQueryIds,
            event,
          });
        }
      }

      return { eventStreamId, dbEventsWithRelatedQueryIds };
    },
  })
  onDbEventsRelatedToQueries(
    @Args('eventStreamId') _: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.DATABASE_BATCH_EVENTS_CHANNEL,
      workspaceId: workspace.id,
    });
  }
}
