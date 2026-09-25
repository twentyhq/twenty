import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { Not } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { buildPublicConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/build-public-connected-account.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';
import { CreateEmailGroupChannelInput } from 'src/engine/metadata-modules/message-channel/dtos/create-email-group-channel.input';
import { UpdateEmailGroupChannelInput } from 'src/engine/metadata-modules/message-channel/dtos/update-email-group-channel.input';
import { CreateEmailGroupChannelOutput } from 'src/engine/metadata-modules/message-channel/dtos/create-email-group-channel.output';
import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { UpdateMessageChannelInput } from 'src/engine/metadata-modules/message-channel/dtos/update-message-channel.input';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelType,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(MessageChannelGraphqlApiExceptionInterceptor)
@MetadataResolver(() => MessageChannelDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class MessageChannelResolver {
  constructor(
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly applicationMessageChannelsService: ApplicationMessageChannelsService,
    @InjectWorkspaceScopedRepository(MessageFolderEntity)
    private readonly messageFolderRepository: WorkspaceScopedRepository<MessageFolderEntity>,
    private readonly messagingProcessGroupEmailActionsService: MessagingProcessGroupEmailActionsService,
  ) {}

  @ResolveField('connectedAccount', () => ConnectedAccountPublicDTO, {
    nullable: true,
  })
  async connectedAccount(
    @Parent() messageChannel: MessageChannelDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true }) userWorkspaceId?: string,
    @AuthApplication({ allowUndefined: true }) application?: FlatApplication,
  ): Promise<ConnectedAccountPublicDTO | null> {
    if (messageChannel.type === MessageChannelType.EMAIL_GROUP) {
      const account = await this.connectedAccountMetadataService.findById({
        id: messageChannel.connectedAccountId,
        workspaceId: workspace.id,
      });

      return buildPublicConnectedAccount(account);
    }

    // An app channel's connection belongs to the application, not to a member,
    // so there is no userWorkspaceId to resolve it through on a cron, webhook
    // or install hook. Reachability is delegated rather than re-derived: the
    // same predicate the app-facing channel API gates on also decides this,
    // including the boundary that stops one member reaching another's private
    // connection through the app.
    if (
      isDefined(application) &&
      messageChannel.type === MessageChannelType.APP
    ) {
      const account =
        await this.applicationMessageChannelsService.findReachableConnectedAccount(
          {
            applicationId: application.id,
            workspaceId: workspace.id,
            requestUserWorkspaceId: userWorkspaceId ?? null,
            connectedAccountId: messageChannel.connectedAccountId,
          },
        );

      return isDefined(account) ? buildPublicConnectedAccount(account) : null;
    }

    if (!isDefined(userWorkspaceId)) {
      return null;
    }

    const account =
      await this.connectedAccountMetadataService.findByIdAndUserWorkspaceId({
        id: messageChannel.connectedAccountId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });

    return buildPublicConnectedAccount(account);
  }

  @Query(() => [MessageChannelDTO])
  @UseGuards(NoPermissionGuard)
  @AllowSuspendedWorkspace()
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
  @UseGuards(CustomPermissionGuard)
  async updateMessageChannel(
    @Args('input') input: UpdateMessageChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApplication({ allowUndefined: true }) application?: FlatApplication,
  ): Promise<MessageChannelDTO> {
    const messageChannel =
      await this.messageChannelMetadataService.verifyAdministrableByCaller({
        id: input.id,
        userWorkspaceId,
        workspaceId: workspace.id,
        applicationId: application?.id,
      });

    // An app channel's settings belong to the app that created it: its
    // visibility is the app's statement about how private its provider's
    // messages are, and the mailbox fields on this input (folder import
    // policy, group-email exclusions, contact auto-creation) have no meaning
    // for it. Mutations go through updateAppMessageChannel instead.
    if (messageChannel.type === MessageChannelType.APP) {
      throw new MessageChannelException(
        `Message channel ${input.id} is owned by an application and cannot be updated through this endpoint`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION,
      );
    }

    const isSyncOngoing =
      messageChannel.syncStage ===
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING;

    const foldersWithPendingAction = await this.messageFolderRepository.find(
      workspace.id,
      {
        where: {
          messageChannelId: messageChannel.id,
          pendingSyncAction: Not(MessageFolderPendingSyncAction.NONE),
        },
      },
    );

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
      messageChannel.type === MessageChannelType.EMAIL &&
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

  @Mutation(() => CreateEmailGroupChannelOutput)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
  async createEmailGroupChannel(
    @Args('input') input: CreateEmailGroupChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<CreateEmailGroupChannelOutput> {
    return this.messageChannelMetadataService.createEmailGroupChannel({
      handle: input.handle,
      displayName: input.displayName,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => MessageChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
  async updateEmailGroupChannel(
    @Args('input') input: UpdateEmailGroupChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<MessageChannelDTO> {
    return this.messageChannelMetadataService.updateEmailGroupChannel({
      id: input.id,
      displayName: input.displayName,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => MessageChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
  async deleteEmailGroupChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<MessageChannelDTO> {
    return this.messageChannelMetadataService.deleteEmailGroupChannel({
      id,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }
}
