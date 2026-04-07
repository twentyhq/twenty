import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';

import { Not, Repository } from 'typeorm';

import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { UpdateMessageChannelInput } from 'src/engine/metadata-modules/message-channel/dtos/update-message-channel.input';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(MessageChannelGraphqlApiExceptionInterceptor)
@MetadataResolver(() => MessageChannelDTO)
export class MessageChannelResolver {
  constructor(
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    @InjectRepository(MessageFolderEntity)
    private readonly messageFolderRepository: Repository<MessageFolderEntity>,
    private readonly messagingProcessGroupEmailActionsService: MessagingProcessGroupEmailActionsService,
  ) {}

  @Query(() => [MessageChannelDTO])
  @UseGuards(NoPermissionGuard)
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
      return this.messageChannelMetadataService.findByConnectedAccountIdForUser(
        {
          connectedAccountId,
          userWorkspaceId,
          workspaceId: workspace.id,
        },
      );
    }

    return this.messageChannelMetadataService.findByUserWorkspaceId({
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => MessageChannelDTO)
  @UseGuards(NoPermissionGuard)
  async updateMessageChannel(
    @Args('input') input: UpdateMessageChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<MessageChannelDTO> {
    const messageChannel =
      await this.messageChannelMetadataService.verifyOwnership({
        id: input.id,
        userWorkspaceId,
        workspaceId: workspace.id,
      });

    const isSyncOngoing =
      messageChannel.syncStage ===
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING;

    const foldersWithPendingAction = await this.messageFolderRepository.find({
      where: {
        messageChannelId: messageChannel.id,
        pendingSyncAction: Not(MessageFolderPendingSyncAction.NONE),
        workspaceId: workspace.id,
      },
    });

    const hasPendingGroupEmailsAction =
      messageChannel.pendingGroupEmailsAction !==
      MessageChannelPendingGroupEmailsAction.NONE;

    if (
      isSyncOngoing &&
      (foldersWithPendingAction.length > 0 || hasPendingGroupEmailsAction)
    ) {
      throw new MessageChannelException(
        'Cannot update message channel while sync is ongoing with pending actions',
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    if (
      messageChannel.syncStage !==
        MessageChannelSyncStage.PENDING_CONFIGURATION &&
      isDefined(input.update.excludeGroupEmails) &&
      input.update.excludeGroupEmails !== messageChannel.excludeGroupEmails
    ) {
      // Service expects WorkspaceEntity type but only reads .id
      await this.messagingProcessGroupEmailActionsService.markMessageChannelAsPendingGroupEmailsAction(
        messageChannel as unknown as MessageChannelEntity,
        workspace.id,
        input.update.excludeGroupEmails
          ? MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION
          : MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT,
      );
    }

    return this.messageChannelMetadataService.update({
      id: input.id,
      workspaceId: workspace.id,
      data: input.update,
    });
  }
}
