import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MessageFolderDTO } from 'src/engine/metadata-modules/message-folder/dtos/message-folder.dto';
import {
  UpdateMessageFolderInput,
  UpdateMessageFoldersInput,
} from 'src/engine/metadata-modules/message-folder/dtos/update-message-folder.input';
import { MessageFolderGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-folder/interceptors/message-folder-graphql-api-exception.interceptor';
import { MessageFolderMetadataService } from 'src/engine/metadata-modules/message-folder/message-folder-metadata.service';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(MessageFolderGraphqlApiExceptionInterceptor)
@MetadataResolver(() => MessageFolderDTO)
export class MessageFolderResolver {
  constructor(
    private readonly messageFolderMetadataService: MessageFolderMetadataService,
  ) {}

  @Query(() => [MessageFolderDTO])
  @UseGuards(NoPermissionGuard)
  async myMessageFolders(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('messageChannelId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    messageChannelId?: string,
  ): Promise<MessageFolderDTO[]> {
    if (messageChannelId) {
      return this.messageFolderMetadataService.findByMessageChannelIdForUser({
        messageChannelId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });
    }

    return this.messageFolderMetadataService.findByUserWorkspaceId({
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => MessageFolderDTO)
  @UseGuards(NoPermissionGuard)
  async updateMessageFolder(
    @Args('input') input: UpdateMessageFolderInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<MessageFolderDTO> {
    await this.messageFolderMetadataService.verifyOwnership({
      id: input.id,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    return this.messageFolderMetadataService.update({
      id: input.id,
      workspaceId: workspace.id,
      data: input.update,
    });
  }

  @Mutation(() => [MessageFolderDTO])
  @UseGuards(NoPermissionGuard)
  async updateMessageFolders(
    @Args('input') input: UpdateMessageFoldersInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<MessageFolderDTO[]> {
    await Promise.all(
      input.ids.map((id) =>
        this.messageFolderMetadataService.verifyOwnership({
          id,
          userWorkspaceId,
          workspaceId: workspace.id,
        }),
      ),
    );

    return this.messageFolderMetadataService.updateMany({
      ids: input.ids,
      workspaceId: workspace.id,
      data: input.update,
    });
  }
}
