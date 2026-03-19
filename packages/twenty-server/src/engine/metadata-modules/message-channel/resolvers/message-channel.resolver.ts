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
import { CreateMessageChannelInput } from 'src/engine/metadata-modules/message-channel/dtos/create-message-channel.input';
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
  ) {}

  @Query(() => [MessageChannelDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async messageChannels(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('connectedAccountId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    connectedAccountId?: string,
  ): Promise<MessageChannelDTO[]> {
    if (connectedAccountId) {
      return (await this.messageChannelMetadataService.findByConnectedAccountId(
        connectedAccountId,
        workspace.id,
      )) as unknown as MessageChannelDTO[];
    }

    return (await this.messageChannelMetadataService.findAll(
      workspace.id,
    )) as unknown as MessageChannelDTO[];
  }

  @Query(() => MessageChannelDTO, { nullable: true })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async messageChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<MessageChannelDTO | null> {
    return (await this.messageChannelMetadataService.findById(
      id,
      workspace.id,
    )) as unknown as MessageChannelDTO | null;
  }

  @Mutation(() => MessageChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async createMessageChannel(
    @Args('input') input: CreateMessageChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<MessageChannelDTO> {
    return (await this.messageChannelMetadataService.create({
      ...input,
      workspaceId: workspace.id,
    })) as unknown as MessageChannelDTO;
  }

  @Mutation(() => MessageChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async updateMessageChannel(
    @Args('input') input: UpdateMessageChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<MessageChannelDTO> {
    return (await this.messageChannelMetadataService.update(
      input.id,
      workspace.id,
      input.update,
    )) as unknown as MessageChannelDTO;
  }

  @Mutation(() => MessageChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async deleteMessageChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<MessageChannelDTO> {
    return (await this.messageChannelMetadataService.delete(
      id,
      workspace.id,
    )) as unknown as MessageChannelDTO;
  }
}
