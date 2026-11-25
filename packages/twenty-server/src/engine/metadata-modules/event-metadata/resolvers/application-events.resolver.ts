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
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { EmitAppEventInput } from 'src/engine/metadata-modules/event-metadata/dtos/emit-app-event.input';
import { EmitAppEventOutput } from 'src/engine/metadata-modules/event-metadata/dtos/emit-app-event.output';
import { EventMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/event-metadata/interceptors/event-metadata-graphql-api-exception.interceptor';
import { ApplicationEventEmitterService } from 'src/engine/metadata-modules/event-metadata/services/application-event-emitter.service';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: false,
      apiKey: false,
      oauthClient: false,
      application: true,
    },
    requiredPermissionFlags: [],
  }),
)
@UseInterceptors(EventMetadataGraphqlApiExceptionInterceptor)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ApplicationEventsResolver {
  constructor(
    private readonly applicationEventEmitterService: ApplicationEventEmitterService,
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
    });
  }
}
