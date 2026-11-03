import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Context, Subscription } from '@nestjs/graphql';

import { mapAsyncIterator } from '@graphql-tools/utils';
import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { EVENT_STREAM_REAUTHORIZATION_INTERVAL_MS } from 'src/engine/metadata-modules/event-metadata/constants/event-stream.constant';
import { AppEventStreamPayloadDTO } from 'src/engine/metadata-modules/event-metadata/dtos/app-event-stream-payload.dto';
import { OnAppEventInput } from 'src/engine/metadata-modules/event-metadata/dtos/on-app-event.input';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { EventMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/event-metadata/interceptors/event-metadata-graphql-api-exception.interceptor';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';
import { MemberEventSubscriptionService } from 'src/engine/metadata-modules/event-metadata/services/member-event-subscription.service';
import { eventMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/event-metadata/utils/event-metadata-graphql-api-exception-handler.util';
import { createSubscriptionAuthorization } from 'src/engine/subscriptions/utils/create-subscription-authorization';
import { withAsyncIteratorAuthorization } from 'src/engine/subscriptions/utils/with-async-iterator-authorization';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';

type AppEventSubscriptionPayload = { onAppEvent: AppEventStreamPayloadDTO };

@UseGuards(
  AuthPrincipalGuard({
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: { withUser: true, withoutUser: false },
  }),
  NoPermissionGuard,
)
@UseInterceptors(EventMetadataGraphqlApiExceptionInterceptor)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class AppEventSubscriptionResolver {
  constructor(
    private readonly memberEventSubscriptionService: MemberEventSubscriptionService,
    private readonly eventRealtimeService: EventRealtimeService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  @Subscription(() => AppEventStreamPayloadDTO)
  async onAppEvent(
    @Args('input') input: OnAppEventInput,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication() application: FlatApplication,
    @Context() context: { req: Request },
  ): Promise<AsyncIterableIterator<AppEventSubscriptionPayload>> {
    const authContext = getWorkspaceAuthContext();
    const accessTokenExpiresAt = this.getAccessTokenExpiresAt(context.req);

    const subscriptions =
      await this.memberEventSubscriptionService.resolveOrThrow({
        workspaceId: workspace.id,
        applicationId: application.id,
        subscriptions: input.subscriptions,
      });

    const authorize = createSubscriptionAuthorization({
      check: async () => {
        if (
          isDefined(accessTokenExpiresAt) &&
          Date.now() >= accessTokenExpiresAt
        ) {
          throw new EventMetadataException(
            'The access token of this event stream has expired',
            EventMetadataExceptionCode.EVENT_STREAM_ACCESS_EXPIRED,
          );
        }

        const canReadAllRecords =
          await this.memberEventSubscriptionService.canReadAllRecords({
            authContext,
            subscriptions,
          });

        if (!canReadAllRecords) {
          throw new EventMetadataException(
            'You cannot read every record these subscriptions are scoped to',
            EventMetadataExceptionCode.EVENT_SUBSCRIPTION_FORBIDDEN,
          );
        }
      },
      maxAgeMs: EVENT_STREAM_REAUTHORIZATION_INTERVAL_MS,
    });

    await authorize().catch(eventMetadataGraphqlApiExceptionHandler);

    const occurrences = await this.eventRealtimeService.subscribeToOccurrences({
      channels: subscriptions.map(({ channel }) => channel),
    });

    const authorizeOrThrowGraphqlError = (force?: boolean) =>
      authorize(force).catch(eventMetadataGraphqlApiExceptionHandler);

    return withAsyncIteratorAuthorization({
      iterator: wrapAsyncIteratorWithLifecycle(
        () =>
          mapAsyncIterator(
            occurrences,
            (occurrence): AppEventSubscriptionPayload => ({
              onAppEvent: { occurrence },
            }),
          ),
        {
          initialValue: { onAppEvent: { occurrence: null } },
          heartbeatStart: 'immediate',
          heartbeatErrorBehavior: 'close',
          heartbeatIntervalMs: EVENT_STREAM_REAUTHORIZATION_INTERVAL_MS,
          onHeartbeat: async () => {
            await authorizeOrThrowGraphqlError(true);

            return true;
          },
        },
      ),
      authorize: authorizeOrThrowGraphqlError,
    });
  }

  private getAccessTokenExpiresAt(request: Request): number | undefined {
    const accessToken = this.jwtWrapperService.extractJwtFromRequest()(request);
    const expiresAtInSeconds = isDefined(accessToken)
      ? this.jwtWrapperService.decode<{ exp?: number }>(accessToken)?.exp
      : undefined;

    return isDefined(expiresAtInSeconds)
      ? expiresAtInSeconds * 1000
      : undefined;
  }
}
