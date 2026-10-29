import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { type AgentChatChannelRoleDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-role.dto';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatCaller } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-caller.type';
import { assertAgentChatChannelExists } from 'src/engine/metadata-modules/ai/ai-chat/utils/assert-agent-chat-channel-exists.util';
import { buildAgentChatChannelDeletionLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-deletion-lock-key.util';
import { isAgentChatChannelOpenToRole } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-channel-open-to-role.util';
import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';
import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';
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
  ) {}

  async findChannels({
    workspaceId,
    caller,
    canManageChannels,
  }: {
    workspaceId: string;
    caller: AgentChatCaller;
    canManageChannels: boolean;
  }): Promise<(FlatAgentChatChannelWithRoleIds & { isAccessible: boolean })[]> {
    const [channels, role] = await Promise.all([
      this.channelMetadataService.findChannels(workspaceId),
      this.channelAccessService.findCallerRole({ workspaceId, caller }),
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
    callingApplication,
    universalIdentifier,
    name,
    icon,
    color,
    roleIds,
  }: {
    workspaceId: string;
    callingApplication: FlatApplication | undefined;
    universalIdentifier: string | undefined;
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
      callingApplication,
      universalIdentifier,
      name,
      icon,
      color,
      roleIds,
    });
  }

  async updateChannel({
    workspaceId,
    caller,
    callingApplication,
    channelId,
    changes: { roleIds, ...changes },
  }: {
    workspaceId: string;
    caller: AgentChatCaller;
    callingApplication: FlatApplication | undefined;
    channelId: string;
    changes: ChannelChanges;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    await this.findChannelCallerCanManageOrThrow({
      workspaceId,
      caller,
      channelId,
    });

    const channel = await this.channelMetadataService.updateChannel({
      workspaceId,
      callingApplication,
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
    caller,
    callingApplication,
    channelId,
    destinationChannelId,
  }: {
    workspaceId: string;
    caller: AgentChatCaller;
    callingApplication: FlatApplication | undefined;
    channelId: string;
    destinationChannelId: string | null;
  }): Promise<void> {
    const channel = await this.findChannelCallerCanManageOrThrow({
      workspaceId,
      caller,
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
      await this.channelAccessService.assertChannelOpenToRole({
        workspaceId,
        channelId: destinationChannelId,
        role: await this.channelAccessService.findCallerRole({
          workspaceId,
          caller,
        }),
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
          callingApplication,
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

  private async findChannelCallerCanManageOrThrow({
    workspaceId,
    caller,
    channelId,
  }: {
    workspaceId: string;
    caller: AgentChatCaller;
    channelId: string;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const channel = await this.channelMetadataService.findChannelOrThrow({
      workspaceId,
      channelId,
    });
    const isChannelNotOwnedByApplicationCaller =
      caller.type === 'applicationWithoutUser' &&
      channel.applicationId !== caller.application.id;

    if (isChannelNotOwnedByApplicationCaller) {
      throwAgentChatChannelNotFound();
    }

    return channel;
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
    return this.threadRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        await assertAgentChatChannelExists({ manager, workspaceId, channelId });

        const threadsBefore = await manager.query<
          AgentChatThreadWorkspaceEntity[]
        >(
          `SELECT * FROM ${table('agentChatThread')}
           WHERE "channelId" = $1 FOR NO KEY UPDATE`,
          [channelId],
        );

        if (threadsBefore.length === 0) {
          return [];
        }

        if (!isDefined(destinationChannelId)) {
          throw new AiException(
            'The channel still has chats',
            AiExceptionCode.CHAT_CHANNEL_NOT_EMPTY,
          );
        }

        await lockAgentChatChannelForThreadWriteOrThrow({
          manager,
          workspaceId,
          channelId: destinationChannelId,
        });

        const threadsAfter = await manager.query<
          AgentChatThreadWorkspaceEntity[]
        >(
          `WITH moved_thread AS (
             UPDATE ${table('agentChatThread')}
             SET "channelId" = $2, "updatedAt" = now()
             WHERE id = ANY($1::uuid[])
             RETURNING *
           )
           SELECT * FROM moved_thread`,
          [threadsBefore.map(({ id }) => id), destinationChannelId],
        );

        await this.channelGrantService.rewriteThreadGrantsInTransaction({
          manager,
          workspaceId,
          threadIds: threadsAfter.map(({ id }) => id),
          affectedChannelIds: [channelId, destinationChannelId],
        });

        const threadBeforeById = new Map(
          threadsBefore.map((thread) => [thread.id, thread]),
        );

        return threadsAfter.flatMap((after) => {
          const before = threadBeforeById.get(after.id);

          return isDefined(before) ? [{ before, after }] : [];
        });
      },
    );
  }
}
