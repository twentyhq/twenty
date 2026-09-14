import { UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CreateAppMessageChannelInput } from 'src/engine/metadata-modules/message-channel/dtos/create-app-message-channel.input';
import { ListAppMessageChannelsInput } from 'src/engine/metadata-modules/message-channel/dtos/list-app-message-channels.input';
import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { UpdateAppMessageChannelInput } from 'src/engine/metadata-modules/message-channel/dtos/update-app-message-channel.input';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseInterceptors(MessageChannelGraphqlApiExceptionInterceptor)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class ApplicationMessageChannelsResolver {
  constructor(
    private readonly applicationMessageChannelsService: ApplicationMessageChannelsService,
  ) {}

  @Query(() => [MessageChannelDTO])
  async appMessageChannels(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('filter', { nullable: true }) filter?: ListAppMessageChannelsInput,
  ): Promise<MessageChannelDTO[]> {
    return this.applicationMessageChannelsService.list({
      applicationId: application.id,
      workspaceId: workspace.id,
      connectedAccountId: filter?.connectedAccountId,
    });
  }

  @Mutation(() => MessageChannelDTO)
  async createAppMessageChannel(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('input') input: CreateAppMessageChannelInput,
  ): Promise<MessageChannelDTO> {
    return this.applicationMessageChannelsService.create({
      applicationId: application.id,
      workspaceId: workspace.id,
      connectedAccountId: input.connectedAccountId,
      handle: input.handle,
      displayName: input.displayName,
      visibility: input.visibility,
    });
  }

  @Mutation(() => MessageChannelDTO)
  async updateAppMessageChannel(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('input') input: UpdateAppMessageChannelInput,
  ): Promise<MessageChannelDTO> {
    return this.applicationMessageChannelsService.update({
      applicationId: application.id,
      workspaceId: workspace.id,
      id: input.id,
      displayName: input.displayName,
      visibility: input.visibility,
      isSyncEnabled: input.isSyncEnabled,
    });
  }

  @Mutation(() => MessageChannelDTO)
  async deleteAppMessageChannel(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<MessageChannelDTO> {
    return this.applicationMessageChannelsService.delete({
      applicationId: application.id,
      workspaceId: workspace.id,
      id,
    });
  }
}
