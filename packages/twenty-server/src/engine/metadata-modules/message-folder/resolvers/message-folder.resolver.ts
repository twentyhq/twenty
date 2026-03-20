import { ForbiddenException, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
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
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  @Query(() => [MessageFolderDTO])
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async myMessageFolders(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @Args('messageChannelId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    messageChannelId?: string,
  ): Promise<MessageFolderDTO[]> {
    if (!isDefined(userWorkspaceId)) {
      throw new ForbiddenException(
        'User-scoped queries require a user context (API keys are not supported)',
      );
    }

    if (messageChannelId) {
      await this.messageChannelMetadataService.verifyOwnership(
        messageChannelId,
        userWorkspaceId,
        workspace.id,
      );

      return this.messageFolderMetadataService.findByMessageChannelId(
        messageChannelId,
        workspace.id,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds(
        userWorkspaceId,
        workspace.id,
      );

    const userChannels =
      await this.messageChannelMetadataService.findByConnectedAccountIds(
        userAccountIds,
        workspace.id,
      );

    const userChannelIds = userChannels.map((channel) => channel.id);

    return this.messageFolderMetadataService.findByMessageChannelIds(
      userChannelIds,
      workspace.id,
    );
  }

  @Mutation(() => MessageFolderDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async updateMessageFolder(
    @Args('input') input: UpdateMessageFolderInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<MessageFolderDTO> {
    if (!isDefined(userWorkspaceId)) {
      throw new ForbiddenException(
        'User-scoped mutations require a user context (API keys are not supported)',
      );
    }

    await this.messageFolderMetadataService.verifyOwnership(
      input.id,
      userWorkspaceId,
      workspace.id,
    );

    return this.messageFolderMetadataService.update(
      input.id,
      workspace.id,
      input.update,
    );
  }
}
