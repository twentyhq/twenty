import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Subscription } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { EVENT_STREAM_TTL_MS } from 'src/engine/subscriptions/constants/event-stream-ttl.constant';
import { AddQuerySubscriptionInput } from 'src/engine/subscriptions/dtos/add-query-subscription.input';
import {
  EventSubscriptionDTO,
  EventWithQueryIdsDTO,
} from 'src/engine/subscriptions/dtos/event-subscription.dto';
import { OnDbEventDTO } from 'src/engine/subscriptions/dtos/on-db-event.dto';
import { OnDbEventInput } from 'src/engine/subscriptions/dtos/on-db-event.input';
import { RemoveQueryFromEventStreamInput } from 'src/engine/subscriptions/dtos/remove-query-subscription.input';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import {
  EventStreamException,
  EventStreamExceptionCode,
} from 'src/engine/subscriptions/event-stream.exception';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/workspace-event-emitter/utils/wrap-async-iterator-with-lifecycle';
import { WorkspaceEventEmitterExceptionFilter } from 'src/engine/workspace-event-emitter/workspace-event-emitter-exception.filter';

import { eventStreamIdToChannelId } from './utils/get-channel-id-from-event-stream-id';

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkspaceEventEmitterExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
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

  @Subscription(() => EventSubscriptionDTO, {
    nullable: true,
    resolve: (
      payload: EventWithQueryIdsDTO[],
      variables: { eventStreamId: string },
    ) => {
      return {
        eventStreamId: variables.eventStreamId,
        eventWithQueryIdsList: payload,
      };
    },
  })
  async onEventSubscription(
    @Args('eventStreamId') eventStreamId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
  ) {
    const eventStreamChannelId = eventStreamIdToChannelId(eventStreamId);

    const streamData = await this.eventStreamService.getStreamData(
      workspace.id,
      eventStreamChannelId,
    );

    if (isDefined(streamData)) {
      throw new EventStreamException(
        'Event stream already exists',
        EventStreamExceptionCode.EVENT_STREAM_ALREADY_EXISTS,
      );
    }

    await this.eventStreamService.createEventStream({
      workspaceId: workspace.id,
      eventStreamChannelId,
      authContext: {
        userId: user?.id,
        userWorkspaceId,
        apiKeyId: apiKey?.id,
      },
    });

    let iterator: AsyncIterableIterator<EventWithQueryIdsDTO[]>;

    try {
      iterator = await this.subscriptionService.subscribeToEventStream({
        workspaceId: workspace.id,
        eventStreamChannelId,
      });
    } catch (error) {
      await this.eventStreamService.destroyEventStream({
        workspaceId: workspace.id,
        eventStreamChannelId,
      });
      throw error;
    }

    return wrapAsyncIteratorWithLifecycle(iterator, {
      onHeartbeat: () =>
        this.eventStreamService.refreshEventStreamTTL({
          workspaceId: workspace.id,
          eventStreamChannelId,
        }),
      heartbeatIntervalMs: EVENT_STREAM_TTL_MS / 5,
      onCleanup: () =>
        this.eventStreamService.destroyEventStream({
          workspaceId: workspace.id,
          eventStreamChannelId,
        }),
    });
  }

  @Mutation(() => Boolean)
  async addQueryToEventStream(
    @Args('input') input: AddQuerySubscriptionInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
  ): Promise<boolean> {
    const eventStreamChannelId = eventStreamIdToChannelId(input.eventStreamId);
    const streamData = await this.eventStreamService.getStreamData(
      workspace.id,
      eventStreamChannelId,
    );

    if (!isDefined(streamData)) {
      throw new EventStreamException(
        'Event stream does not exist',
        EventStreamExceptionCode.EVENT_STREAM_DOES_NOT_EXIST,
      );
    }
    const isAuthorized = await this.eventStreamService.isAuthorized({
      streamData,
      authContext: {
        userWorkspaceId,
        apiKeyId: apiKey?.id,
      },
    });

    if (!isAuthorized) {
      throw new EventStreamException(
        'You are not authorized to add a query to this event stream',
        EventStreamExceptionCode.NOT_AUTHORIZED,
      );
    }
    await this.eventStreamService.addQuery({
      workspaceId: workspace.id,
      eventStreamChannelId,
      queryId: input.queryId,
      operationSignature: input.operationSignature,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async removeQueryFromEventStream(
    @Args('input') input: RemoveQueryFromEventStreamInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
  ): Promise<boolean> {
    const eventStreamChannelId = eventStreamIdToChannelId(input.eventStreamId);

    const streamData = await this.eventStreamService.getStreamData(
      workspace.id,
      eventStreamChannelId,
    );

    if (!isDefined(streamData)) {
      throw new EventStreamException(
        'Event stream does not exist',
        EventStreamExceptionCode.EVENT_STREAM_DOES_NOT_EXIST,
      );
    }

    const isAuthorized = await this.eventStreamService.isAuthorized({
      streamData,
      authContext: {
        userWorkspaceId,
        apiKeyId: apiKey?.id,
      },
    });

    if (!isAuthorized) {
      throw new EventStreamException(
        'You are not authorized to remove a query from this event stream',
        EventStreamExceptionCode.NOT_AUTHORIZED,
      );
    }

    await this.eventStreamService.removeQuery({
      workspaceId: workspace.id,
      eventStreamChannelId,
      queryId: input.queryId,
    });

    return true;
  }
}
