import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Subscription } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
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
import { EventSubscriptionDTO } from 'src/engine/subscriptions/dtos/event-subscription.dto';
import { RemoveQueryFromEventStreamInput } from 'src/engine/subscriptions/dtos/remove-query-subscription.input';
import { EventStreamExceptionFilter } from 'src/engine/subscriptions/event-stream-exception.filter';
import {
  EventStreamException,
  EventStreamExceptionCode,
} from 'src/engine/subscriptions/event-stream.exception';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { eventStreamIdToChannelId } from 'src/engine/subscriptions/utils/get-channel-id-from-event-stream-id';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(EventStreamExceptionFilter, PreventNestToAutoLogGraphqlErrorsFilter)
export class EventStreamResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly eventStreamService: EventStreamService,
  ) {}

  @Subscription(() => EventSubscriptionDTO, {
    nullable: true,
    resolve: (
      payload: EventStreamPayload,
      variables: { eventStreamId: string },
    ) => {
      return {
        eventStreamId: variables.eventStreamId,
        objectRecordEventsWithQueryIds: payload.objectRecordEventsWithQueryIds,
        metadataEvents: payload.metadataEvents,
      };
    },
  })
  async onEventSubscription(
    @Args('eventStreamId') eventStreamId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user: AuthContextUser | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
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

    let iterator: AsyncIterableIterator<EventStreamPayload>;

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
      initialValue: {
        objectRecordEventsWithQueryIds: [],
        metadataEvents: [],
      },
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
    @AuthUser({ allowUndefined: true }) user: AuthContextUser | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
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
    @AuthUser({ allowUndefined: true }) user: AuthContextUser | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
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
