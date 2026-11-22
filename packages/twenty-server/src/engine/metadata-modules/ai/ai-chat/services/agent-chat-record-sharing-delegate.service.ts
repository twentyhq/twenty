import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { DENIED_RECORD_PERMISSIONS } from 'src/engine/permissions/record-permissions/constants/denied-record-permissions.constant';
import {
  type RecordSharePrincipalInput,
  type RecordSharingDTO,
  type RecordSharingGrantDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { RecordSharingDelegateRegistryService } from 'src/engine/permissions/record-share/services/record-sharing-delegate-registry.service';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// With chat RLS on, sharing a chat adds the member as a participant
@Injectable()
export class AgentChatRecordSharingDelegateService implements OnModuleInit {
  constructor(
    private readonly recordSharingDelegateRegistryService: RecordSharingDelegateRegistryService,
    private readonly sharingService: AgentChatSharingService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(AgentChatChannelRoleEntity)
    private readonly channelRoleRepository: Repository<AgentChatChannelRoleEntity>,
  ) {}

  onModuleInit(): void {
    this.recordSharingDelegateRegistryService.register({
      objectUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      isEnabled: (workspaceId) =>
        this.sharingService.isAgentChatRlsEnabled(workspaceId),
      findRecordSharing: (args) => this.findRecordSharing(args),
      setShare: (args) => this.addParticipant(args),
      removeShare: (args) => this.removeParticipant(args),
    });
  }

  private async findRecordSharing(
    args: RecordSharingArgs,
  ): Promise<RecordSharingDTO> {
    const thread = await this.sharingService
      .getReadableThread(this.toThreadAccessArgs(args))
      .catch(() => {
        throw new NotFoundError('Record not found');
      });
    const permissions =
      (
        await this.recordPermissionsReadService.findRecordsActions({
          authContext: args.authContext,
          objectNameSingular: 'agentChatThread',
          recordIds: [args.recordId],
        })
      ).get(args.recordId) ?? DENIED_RECORD_PERMISSIONS;
    const canManageSharing = permissions.canUpdate;

    return {
      isShareable: true,
      isPrivate: true,
      canManageSharing,
      permissions,
      hasManagedGeneralAccess: false,
      shares: canManageSharing ? await this.buildGrants(args, thread) : [],
      roles: canManageSharing ? await this.buildRoles(args) : [],
    };
  }

  private async addParticipant({
    principal,
    accessLevel,
    ...args
  }: RecordSharingArgs & {
    principal: RecordSharePrincipalInput;
    accessLevel: RecordShareAccessLevel;
  }): Promise<RecordSharingDTO> {
    const workspaceMemberId = this.findMemberPrincipalOrThrow(principal);

    if (accessLevel !== RecordShareAccessLevel.NONE) {
      const [addedWorkspaceMemberId] =
        await this.inboxDeliveryService.deliverThreadToMemberInboxes({
          ...this.toThreadAccessArgs(args),
          workspaceMemberIds: [workspaceMemberId],
          reason: AgentChatInboxDeliveryReason.RECIPIENT,
        });

      if (!isDefined(addedWorkspaceMemberId)) {
        throw new RecordShareException(
          'This member cannot use chats',
          RecordShareExceptionCode.INVALID_SHARE_WITH,
        );
      }
    }

    return this.findRecordSharing(args);
  }

  private async removeParticipant({
    principal,
    ...args
  }: RecordSharingArgs & {
    principal: RecordSharePrincipalInput;
  }): Promise<RecordSharingDTO> {
    const workspaceMemberId = this.findMemberPrincipalOrThrow(principal);
    const thread = await this.sharingService.getThreadWithAccess({
      ...this.toThreadAccessArgs(args),
      operationType: 'update',
    });

    if (thread.workspaceMemberId === workspaceMemberId) {
      throw new RecordShareException(
        'The owner of a chat cannot be removed from it',
        RecordShareExceptionCode.INVALID_SHARE_WITH,
      );
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithoutPermissionChecks<AgentChatThreadParticipantRow>(
            'agentChatThreadParticipant',
          )
          .delete({ threadId: args.recordId, workspaceMemberId }),
      buildSystemAuthContext(args.authContext.workspace.id),
    );

    return this.findRecordSharing(args);
  }

  private async buildGrants(
    args: RecordSharingArgs,
    thread: AgentChatThreadWorkspaceEntity,
  ): Promise<RecordSharingGrantDTO[]> {
    const workspaceId = args.authContext.workspace.id;
    const participants =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<AgentChatThreadParticipantRow>(
              'agentChatThreadParticipant',
            )
            .find({ where: { threadId: args.recordId } }),
        buildSystemAuthContext(workspaceId),
      );
    const channelRoles = isDefined(thread.channelId)
      ? await this.channelRoleRepository.find({
          select: { roleId: true },
          where: { workspaceId, channelId: thread.channelId },
        })
      : [];

    return [
      ...participants.map(({ id, workspaceMemberId }) => {
        const isOwner = workspaceMemberId === thread.workspaceMemberId;

        return {
          id,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          principalId: workspaceMemberId,
          principalRoleId: null,
          accessLevel: isOwner
            ? RecordShareAccessLevel.FULL
            : RecordShareAccessLevel.READ_WRITE,
          rowCause: isOwner
            ? RecordShareRowCause.OWNER
            : RecordShareRowCause.MANUAL,
        };
      }),
      ...channelRoles.map(({ roleId }) => ({
        id: roleId,
        principalType: RecordSharePrincipalType.ROLE,
        principalId: roleId,
        principalRoleId: null,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
        rowCause: RecordShareRowCause.RULE,
      })),
    ];
  }

  private async buildRoles(args: RecordSharingArgs) {
    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      args.authContext.workspace.id,
      ['flatRoleMaps'],
    );

    return Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(({ canBeAssignedToUsers }) => canBeAssignedToUsers)
      .map(({ id, label }) => ({ id, label, canRead: null, canUpdate: null }));
  }

  private findMemberPrincipalOrThrow(
    principal: RecordSharePrincipalInput,
  ): string {
    if (!isDefined(principal.workspaceMemberId)) {
      throw new RecordShareException(
        'Chats are shared with members only',
        RecordShareExceptionCode.INVALID_SHARE_WITH,
      );
    }

    return principal.workspaceMemberId;
  }

  private toThreadAccessArgs({ authContext, recordId }: RecordSharingArgs) {
    return {
      workspaceId: authContext.workspace.id,
      workspaceMemberId: authContext.workspaceMemberId,
      threadId: recordId,
    };
  }
}
