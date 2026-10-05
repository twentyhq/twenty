import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { IngestAppMessagesInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { IngestAppMessagesOutput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.output';
import { ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';

@UseGuards(
  AuthPrincipalGuard({
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: true,
  }),
  NoPermissionGuard,
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
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
