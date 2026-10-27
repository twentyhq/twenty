import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { CreateAppVisitorEventTokenInput } from 'src/engine/metadata-modules/event-metadata/dtos/create-app-visitor-event-token.input';
import { CreateAppVisitorEventTokenOutput } from 'src/engine/metadata-modules/event-metadata/dtos/create-app-visitor-event-token.output';
import { EmitAppEventInput } from 'src/engine/metadata-modules/event-metadata/dtos/emit-app-event.input';
import { EmitAppEventOutput } from 'src/engine/metadata-modules/event-metadata/dtos/emit-app-event.output';
import { EventMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/event-metadata/interceptors/event-metadata-graphql-api-exception.interceptor';
import { ApplicationEventEmitterService } from 'src/engine/metadata-modules/event-metadata/services/application-event-emitter.service';
import { VisitorEventTokenService } from 'src/engine/metadata-modules/event-metadata/services/visitor-event-token.service';

@UseGuards(
  AuthPrincipalGuard({
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: true,
  }),
  NoPermissionGuard,
)
@UseInterceptors(EventMetadataGraphqlApiExceptionInterceptor)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ApplicationEventsResolver {
  constructor(
    private readonly applicationEventEmitterService: ApplicationEventEmitterService,
    private readonly visitorEventTokenService: VisitorEventTokenService,
  ) {}

  @Mutation(() => EmitAppEventOutput)
  async emitAppEvent(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('input') input: EmitAppEventInput,
  ): Promise<EmitAppEventOutput> {
    return this.applicationEventEmitterService.emit({
      workspaceId: workspace.id,
      applicationId: application.id,
      event: input.event,
      properties: input.properties ?? {},
      anonymousId: input.anonymousId ?? null,
    });
  }

  @Mutation(() => CreateAppVisitorEventTokenOutput)
  async createAppVisitorEventToken(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('input') input: CreateAppVisitorEventTokenInput,
  ): Promise<CreateAppVisitorEventTokenOutput> {
    return this.visitorEventTokenService.create({
      workspaceId: workspace.id,
      applicationId: application.id,
      anonymousId: input.anonymousId,
      events: input.events,
      expiresInSeconds: input.expiresInSeconds,
    });
  }
}
