import {
  UseGuards,
  UseInterceptors,
  UsePipes,
  UseFilters,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { ListAppMessageFoldersInput } from 'src/engine/metadata-modules/message-channel/dtos/list-app-message-folders.input';
import { SyncAppMessageFoldersInput } from 'src/engine/metadata-modules/message-channel/dtos/sync-app-message-folders.input';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { ApplicationMessageFoldersService } from 'src/engine/metadata-modules/message-channel/services/application-message-folders.service';
import { MessageFolderDTO } from 'src/engine/metadata-modules/message-folder/dtos/message-folder.dto';

@UseGuards(
  AuthPrincipalGuard({
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: true,
  }),
  NoPermissionGuard,
)
@UseInterceptors(MessageChannelGraphqlApiExceptionInterceptor)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ApplicationMessageFoldersResolver {
  constructor(
    private readonly applicationMessageFoldersService: ApplicationMessageFoldersService,
  ) {}

  @Query(() => [MessageFolderDTO])
  async appMessageFolders(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('filter', { nullable: true }) filter?: ListAppMessageFoldersInput,
  ): Promise<MessageFolderDTO[]> {
    return this.applicationMessageFoldersService.list({
      applicationId: application.id,
      workspaceId: workspace.id,
      requestUserWorkspaceId: userWorkspaceId ?? null,
      messageChannelId: filter?.messageChannelId,
    });
  }

  @Mutation(() => [MessageFolderDTO])
  async syncAppMessageFolders(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input') input: SyncAppMessageFoldersInput,
  ): Promise<MessageFolderDTO[]> {
    return this.applicationMessageFoldersService.sync({
      applicationId: application.id,
      workspaceId: workspace.id,
      requestUserWorkspaceId: userWorkspaceId ?? null,
      messageChannelId: input.messageChannelId,
      folders: input.folders,
    });
  }
}
