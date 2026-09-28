import {
  UseGuards,
  UseInterceptors,
  UsePipes,
  UseFilters,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { IngestAppMessagesInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { IngestAppMessagesOutput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.output';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseInterceptors(MessageChannelGraphqlApiExceptionInterceptor)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ApplicationMessageIngestionResolver {
  constructor(
    private readonly applicationMessageIngestionService: ApplicationMessageIngestionService,
  ) {}

  @Mutation(() => IngestAppMessagesOutput)
  async ingestAppMessages(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input') input: IngestAppMessagesInput,
  ): Promise<IngestAppMessagesOutput> {
    return this.applicationMessageIngestionService.ingest({
      applicationId: application.id,
      workspaceId: workspace.id,
      requestUserWorkspaceId: userWorkspaceId ?? null,
      messageChannelId: input.messageChannelId,
      messages: input.messages,
    });
  }
}
