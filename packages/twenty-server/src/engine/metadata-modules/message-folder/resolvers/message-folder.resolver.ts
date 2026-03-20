import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateMessageFolderInput } from 'src/engine/metadata-modules/message-folder/dtos/create-message-folder.input';
import { MessageFolderDTO } from 'src/engine/metadata-modules/message-folder/dtos/message-folder.dto';
import { UpdateMessageFolderInput } from 'src/engine/metadata-modules/message-folder/dtos/update-message-folder.input';
import { MessageFolderGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-folder/interceptors/message-folder-graphql-api-exception.interceptor';
import { MessageFolderMetadataService } from 'src/engine/metadata-modules/message-folder/message-folder-metadata.service';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@UseInterceptors(MessageFolderGraphqlApiExceptionInterceptor)
@MetadataResolver(() => MessageFolderDTO)
export class MessageFolderResolver {
  constructor(
    private readonly messageFolderMetadataService: MessageFolderMetadataService,
  ) {}

  @Query(() => [MessageFolderDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async messageFolders(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('messageChannelId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    messageChannelId?: string,
  ): Promise<MessageFolderDTO[]> {
    if (messageChannelId) {
      return this.messageFolderMetadataService.findByMessageChannelId(
        messageChannelId,
        workspace.id,
      );
    }

    return this.messageFolderMetadataService.findAll(workspace.id);
  }

  @Query(() => MessageFolderDTO, { nullable: true })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async messageFolder(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<MessageFolderDTO | null> {
    return this.messageFolderMetadataService.findById(id, workspace.id);
  }

  @Mutation(() => MessageFolderDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async createMessageFolder(
    @Args('input') input: CreateMessageFolderInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<MessageFolderDTO> {
    return this.messageFolderMetadataService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => MessageFolderDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async updateMessageFolder(
    @Args('input') input: UpdateMessageFolderInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<MessageFolderDTO> {
    return this.messageFolderMetadataService.update(
      input.id,
      workspace.id,
      input.update,
    );
  }

  @Mutation(() => MessageFolderDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async deleteMessageFolder(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<MessageFolderDTO> {
    return this.messageFolderMetadataService.delete(id, workspace.id);
  }
}
