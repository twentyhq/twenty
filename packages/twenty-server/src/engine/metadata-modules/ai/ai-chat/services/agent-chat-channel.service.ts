import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { Any } from 'typeorm';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { type AgentChatChannelRoleDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-role.dto';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { buildAgentChatChannelDeletionLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-deletion-lock-key.util';
import { isAgentChatChannelOpenToRole } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-channel-open-to-role.util';
import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';
import { throwAgentChatChannelsUnavailable } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channels-unavailable.util';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ChannelChanges = {
  name?: string;
  icon?: string | null;
  color?: string | null;
  position?: number;
  roleIds?: string[];
};

@Injectable()
export class AgentChatChannelService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly channelMetadataService: AgentChatChannelMetadataService,
    private readonly channelAccessService: AgentChatChannelAccessService,
    private readonly channelGrantService: AgentChatChannelGrantService,
    private readonly sharingService: AgentChatSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(AgentChatChannelEntity)
    private readonly channelRepository: WorkspaceScopedRepository<AgentChatChannelEntity>,
  ) {}

  async findChannels({
    authContext,
    canManageChannels,
  }: {
    authContext: AgentInboxCallerAuthContext;
    canManageChannels: boolean;
  }): Promise<(FlatAgentChatChannelWithRoleIds & { isAccessible: boolean })[]> {
    const [channels, role] = await Promise.all([
      this.channelMetadataService.findChannels(authContext.workspace.id),
      this.channelAccessService.findCallerRole(authContext),
    ]);

    return channels
      .map((channel) => ({
        ...channel,
        isAccessible: isAgentChatChannelOpenToRole({ channel, role }),
      }))
      .filter(({ isAccessible }) => canManageChannels || isAccessible);
  }

  async createChannel({
    workspaceId,
    name,
    icon,
    color,
    roleIds,
  }: {
    workspaceId: string;
    name: string;
    icon: string | null;
    color: string | null;
    roleIds: string[];
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    if (!(await this.sharingService.hasChannels(workspaceId))) {
      throwAgentChatChannelsUnavailable();
    }

    return this.channelMetadataService.createChannel({
      workspaceId,
      name,
      icon,
      color,
      roleIds,
    });
  }

  async updateChannel({
    workspaceId,
    channelId,
    changes: { roleIds, ...changes },
  }: {
    workspaceId: string;
    channelId: string;
    changes: ChannelChanges;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const channel = await this.channelMetadataService.updateChannel({
      workspaceId,
      channelId,
      changes,
      roleIds,
    });

    if (isDefined(roleIds)) {
      await this.channelGrantService
        .rewriteChannelGrants({ workspaceId, channelId })
        .catch(async (error: unknown) => {
          await this.channelGrantService.enqueueChannelGrantsRewrite({
            workspaceId,
            channelId,
          });

          throw error;
        });
    }

    return channel;
  }

  // A channel's chats would read through nothing once it is gone, so they
  // move to another channel first
  async deleteChannel({
    workspaceId,
    workspaceMemberId,
    channelId,
    destinationChannelId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    channelId: string;
    destinationChannelId: string | null;
  }): Promise<void> {
    const channel = await this.channelMetadataService.findChannelOrThrow({
      workspaceId,
      channelId,
    });

    // The standard sync would bring a standard channel back, so its chats stay
    if (belongsToTwentyStandardApp(channel)) {
      throw new AiException(
        'A standard channel cannot be deleted',
        AiExceptionCode.CHAT_CHANNEL_IS_STANDARD,
      );
    }

    if (destinationChannelId === channelId) {
      throw new AiException(
        'A channel cannot move its chats to itself',
        AiExceptionCode.INVALID_CHAT_CHANNEL_DESTINATION,
      );
    }

    if (isDefined(destinationChannelId)) {
      await this.channelAccessService.assertChannelAccess({
        workspaceId,
        workspaceMemberId,
        channelId: destinationChannelId,
      });
    }

    const lockResult = await this.postgresAdvisoryLockService.tryWithLock(
      buildAgentChatChannelDeletionLockKey({ workspaceId, channelId }),
      async () => {
        const movedThreads = await this.moveChannelThreads({
          workspaceId,
          channelId,
          destinationChannelId,
        });

        await this.threadRecordEventService.emitThreadsUpdated({
          workspaceId,
          threads: movedThreads,
        });

        await this.channelMetadataService.deleteChannel({
          workspaceId,
          channelId,
        });
      },
    );

    if (!lockResult.acquired) {
      throwAgentChatChannelBusy();
    }
  }

  // Channel managers may lack roles settings access, hence this list
  async findAssignableRoles(
    workspaceId: string,
  ): Promise<AgentChatChannelRoleDTO[]> {
    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );

    return Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((role) => role.canBeAssignedToUsers)
      .map(({ id, label, icon, canAccessAllAgentChatChannels }) => ({
        id,
        label,
        icon,
        canAccessAllAgentChatChannels,
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }

  // Moved chats keep their channel status
  private async moveChannelThreads({
    workspaceId,
    channelId,
    destinationChannelId,
  }: {
    workspaceId: string;
    channelId: string;
    destinationChannelId: string | null;
  }): Promise<
    {
      before: AgentChatThreadWorkspaceEntity;
      after: AgentChatThreadWorkspaceEntity;
    }[]
  > {
    const [doesSourceChannelExist, doesSourceChannelHaveThreads] =
      await Promise.all([
        this.channelRepository.existsBy(workspaceId, { id: channelId }),
        this.threadRepository.existsBy(workspaceId, { channelId }),
      ]);

    if (!doesSourceChannelExist) {
      throw new AiException(
        'Chat channel not found',
        AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
      );
    }

    if (!doesSourceChannelHaveThreads) {
      return [];
    }

    if (!isDefined(destinationChannelId)) {
      throw new AiException(
        'The channel still has chats',
        AiExceptionCode.CHAT_CHANNEL_NOT_EMPTY,
      );
    }

    const { threadsBefore, threadsAfter } =
      await this.workspaceOrmManager.executeTransactionInWorkspaceContext(
        async (transactionScope) => {
          await lockAgentChatChannelForThreadWriteOrThrow({
            transactionScope,
            channelRepository: this.channelRepository,
            workspaceId,
            channelId: destinationChannelId,
          });

          const threadRepository =
            transactionScope.getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
              'agentChatThread',
              { shouldSkipEventEmission: true },
            );
          const threadsBefore = await threadRepository.find({
            where: { channelId },
            withDeleted: true,
          });
          const movedThreadIds = threadsBefore.map(({ id }) => id);

          await WorkspaceSelectQueryBuilder.toMutationQueryBuilder(
            threadRepository
              .createQueryBuilder()
              .where({ channelId })
              .withDeleted(),
            'update',
          )
            .set({ channelId: destinationChannelId })
            .returning(['id'])
            .execute();

          const threadsAfter = await threadRepository.find({
            where: { id: Any(movedThreadIds) },
            withDeleted: true,
          });

          await this.channelGrantService.rewriteThreadGrantsInTransaction({
            transactionScope,
            workspaceId,
            threadIds: movedThreadIds,
            affectedChannelIds: [channelId, destinationChannelId],
          });

          return { threadsBefore, threadsAfter };
        },
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );
    const threadAfterById = new Map(
      threadsAfter.map((threadAfter) => [threadAfter.id, threadAfter]),
    );

    return threadsBefore.flatMap((before) => {
      const after = threadAfterById.get(before.id);

      return isDefined(after) ? [{ before, after }] : [];
    });
  }
}
