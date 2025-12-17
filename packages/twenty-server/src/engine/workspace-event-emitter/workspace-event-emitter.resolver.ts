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
import { QueryParserService } from 'src/engine/subscriptions/services/query-parser.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class SubscriptionsResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly queryParserService: QueryParserService,
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
    resolve: function (
      this: SubscriptionsResolver,
      payload: { onDbEvent: OnDbEventDTO },
      args: { subscriptions: QuerySubscriptionInput[] },
    ): RefetchSignalDTO | null {
      const matchedSubscriptionIds = args.subscriptions
        .filter((subscription) =>
          this.queryMatchesEvent(subscription.query, payload.onDbEvent),
        )
        .map((subscription) => subscription.id);

      if (matchedSubscriptionIds.length === 0) {
        return null;
      }

      return { subscriptionIds: matchedSubscriptionIds };
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

  private queryMatchesEvent(queryString: string, event: OnDbEventDTO): boolean {
    const parsed = this.queryParserService.parseQueryForMatching(queryString);

    if (!parsed.objectName) {
      return false;
    }

    // Check if query targets the same object type
    const queryObjectName = parsed.objectName.toLowerCase();
    const eventObjectName = event.objectNameSingular.toLowerCase();
    const normalizedQueryObjectName =
      this.normalizePluralToSingular(queryObjectName);

    const isObjectNameMatching =
      queryObjectName === eventObjectName ||
      normalizedQueryObjectName === eventObjectName;

    if (!isObjectNameMatching) {
      return false;
    }

    // If query targets a specific record, check if it matches
    if (isDefined(parsed.recordId) && parsed.recordId !== event.record.id) {
      return false;
    }

    // If event has updatedFields and query has specific fields, check overlap
    if (
      isDefined(event.updatedFields) &&
      event.updatedFields.length > 0 &&
      parsed.fields.length > 0
    ) {
      const hasFieldOverlap = parsed.fields.some((field) =>
        event.updatedFields?.includes(field),
      );

      if (!hasFieldOverlap) {
        return false;
      }
    }

    return true;
  }

  private normalizePluralToSingular(name: string): string {
    // Handle common plural patterns
    if (name === 'people') {
      return 'person';
    }

    if (name.endsWith('ies')) {
      // companies -> company, activities -> activity
      return name.slice(0, -3) + 'y';
    }

    if (name.endsWith('s')) {
      // tasks -> task, notes -> note
      return name.slice(0, -1);
    }

    return name;
  }
}
