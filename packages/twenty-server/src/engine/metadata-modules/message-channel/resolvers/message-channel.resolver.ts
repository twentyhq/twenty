import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

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
import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { UpdateMessageChannelInput } from 'src/engine/metadata-modules/message-channel/dtos/update-message-channel.input';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@UseInterceptors(MessageChannelGraphqlApiExceptionInterceptor)
@MetadataResolver(() => MessageChannelDTO)
export class MessageChannelResolver {
  constructor(
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  @Query(() => [MessageChannelDTO])
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async myMessageChannels(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('connectedAccountId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    connectedAccountId?: string,
  ): Promise<MessageChannelDTO[]> {
    if (connectedAccountId) {
      await this.connectedAccountMetadataService.verifyOwnership(
        connectedAccountId,
        userWorkspaceId,
        workspace.id,
      );

      return this.messageChannelMetadataService.findByConnectedAccountId(
        connectedAccountId,
        workspace.id,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds(
        userWorkspaceId,
        workspace.id,
      );

    return this.messageChannelMetadataService.findByConnectedAccountIds(
      userAccountIds,
      workspace.id,
    );
  }

  @Mutation(() => MessageChannelDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async updateMessageChannel(
    @Args('input') input: UpdateMessageChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<MessageChannelDTO> {
    await this.messageChannelMetadataService.verifyOwnership(
      input.id,
      userWorkspaceId,
      workspace.id,
    );

    return this.messageChannelMetadataService.update(
      input.id,
      workspace.id,
      input.update,
    );
  }
}
