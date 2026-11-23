import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordsOperationType,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type RecordSharingDTO } from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

// With chat RLS on, a chat is shared by adding members as participants; the
// response keeps the share panel's shape so the panel stays the same
@Injectable()
export class AgentChatThreadMemberService {
  constructor(
    private readonly sharingService: AgentChatSharingService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(AgentChatChannelRoleEntity)
    private readonly channelRoleRepository: WorkspaceScopedRepository<AgentChatChannelRoleEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
  ) {}

  async findMembers(
    args: AgentChatThreadAccessArgs,
  ): Promise<RecordSharingDTO> {
    await this.assertAgentChatRlsEnabledOrThrow(args.workspaceId);

    const thread = await this.sharingService.getReadableThread(args);
    const [canUpdate, canSoftDelete, canDestroy] = await Promise.all(
      (['update', 'softDelete', 'destroy'] as ObjectRecordsOperationType[]).map(
        (operationType) =>
          this.sharingService
            .getThreadWithAccess({ ...args, operationType })
            .then(() => true)
            .catch(() => false),
      ),
    );
    const canManageSharing =
      canUpdate && thread.workspaceMemberId === args.workspaceMemberId;
    const { shares, roles } = canManageSharing
      ? await this.buildSharesAndRoles({
          workspaceId: args.workspaceId,
          thread,
        })
      : { shares: [], roles: [] };

    return {
      isShareable: true,
      isPrivate: true,
      canManageSharing,
      permissions: {
        canRead: true,
        canUpdate,
        canSoftDelete,
        canDelete: canDestroy,
      },
      hasManagedGeneralAccess: false,
      shares,
      roles,
    };
  }

  async addMember({
    memberWorkspaceMemberId,
    ...args
  }: AgentChatThreadAccessArgs & {
    memberWorkspaceMemberId: string;
  }): Promise<RecordSharingDTO> {
    await this.assertAgentChatRlsEnabledOrThrow(args.workspaceId);
    await this.getManagedThreadOrThrow(args);

    const [addedWorkspaceMemberId] =
      await this.inboxDeliveryService.deliverThreadToMemberInboxes({
        ...args,
        workspaceMemberIds: [memberWorkspaceMemberId],
        reason: AgentChatInboxDeliveryReason.RECIPIENT,
      });

    if (
      !isDefined(addedWorkspaceMemberId) &&
      memberWorkspaceMemberId !== args.workspaceMemberId
    ) {
      throw new AiException(
        'This member cannot use chats',
        AiExceptionCode.CHAT_THREAD_MEMBER_CANNOT_REPLY,
      );
    }

    return this.findMembers(args);
  }

  async removeMember({
    memberWorkspaceMemberId,
    ...args
  }: AgentChatThreadAccessArgs & {
    memberWorkspaceMemberId: string;
  }): Promise<RecordSharingDTO> {
    await this.assertAgentChatRlsEnabledOrThrow(args.workspaceId);

    const thread = await this.getManagedThreadOrThrow(args);

    if (thread.workspaceMemberId === memberWorkspaceMemberId) {
      throw new AiException(
        'The owner of a chat cannot be removed from it',
        AiExceptionCode.CHAT_THREAD_OWNER_CANNOT_BE_REMOVED,
      );
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithoutPermissionChecks<AgentChatThreadParticipantRow>(
            'agentChatThreadParticipant',
          )
          .delete({
            threadId: args.threadId,
            workspaceMemberId: memberWorkspaceMemberId,
          }),
      buildSystemAuthContext(args.workspaceId),
    );

    return this.findMembers(args);
  }

  // Only the owner manages members, as only a FULL share could manage sharing before
  private async getManagedThreadOrThrow(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    const thread = await this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });

    if (thread.workspaceMemberId !== args.workspaceMemberId) {
      throw new AiException(
        'Only the owner of a chat can change its members',
        AiExceptionCode.CHAT_THREAD_MEMBERS_MANAGED_BY_OWNER,
      );
    }

    return thread;
  }

  private async assertAgentChatRlsEnabledOrThrow(
    workspaceId: string,
  ): Promise<void> {
    if (!(await this.sharingService.isAgentChatRlsEnabled(workspaceId))) {
      throwAgentChatThreadNotFound();
    }
  }

  private async buildSharesAndRoles({
    workspaceId,
    thread,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
  }): Promise<Pick<RecordSharingDTO, 'shares' | 'roles'>> {
    const participants =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<AgentChatThreadParticipantRow>(
              'agentChatThreadParticipant',
            )
            .find({ where: { threadId: thread.id } }),
        buildSystemAuthContext(workspaceId),
      );
    const channelRoleIds = isDefined(thread.channelId)
      ? (
          await this.channelRoleRepository.find(workspaceId, {
            select: { roleId: true },
            where: { channelId: thread.channelId },
          })
        ).map(({ roleId }) => roleId)
      : [];
    const channelRoles = await this.roleRepository.find(workspaceId, {
      select: { id: true, label: true },
      where: { id: In(channelRoleIds) },
    });

    return {
      shares: [
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
        ...channelRoles.map(({ id }) => ({
          id,
          principalType: RecordSharePrincipalType.ROLE,
          principalId: id,
          principalRoleId: null,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
          rowCause: RecordShareRowCause.RULE,
        })),
      ],
      roles: channelRoles.map(({ id, label }) => ({
        id,
        label,
        canRead: true,
        canUpdate: true,
      })),
    };
  }
}
