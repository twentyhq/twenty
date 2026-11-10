import { Injectable } from '@nestjs/common';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Any, In } from 'typeorm';

import { RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { AGENT_CHAT_CHANNEL_GRANTS_REWRITE_JOB_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-grants-rewrite-job-options.constant';
import { REWRITE_AGENT_CHAT_CHANNEL_GRANTS_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants-job-name.constant';
import { type RewriteAgentChatChannelGrantsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants-job.types';
import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';
import { acquireAgentChatChannelGrantLocksForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks-for-thread-write-or-throw.util';
import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';
import { buildAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-rule-grants.util';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// A chat's only RULE grants, so each rewrite owns every RULE grant in its scope
@Injectable()
export class AgentChatChannelGrantService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareSystemWriteService: RecordShareSystemWriteService,
    @InjectWorkspaceScopedRepository(AgentChatChannelEntity)
    private readonly channelRepository: WorkspaceScopedRepository<AgentChatChannelEntity>,
    @InjectWorkspaceScopedRepository(AgentChatChannelRoleEntity)
    private readonly channelRoleRepository: WorkspaceScopedRepository<AgentChatChannelRoleEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
  ) {}

  async enqueueChannelGrantsRewrite(
    data: RewriteAgentChatChannelGrantsJobData,
  ): Promise<void> {
    await this.workspaceQueueService.add<RewriteAgentChatChannelGrantsJobData>(
      REWRITE_AGENT_CHAT_CHANNEL_GRANTS_JOB_NAME,
      data,
      {
        ...AGENT_CHAT_CHANNEL_GRANTS_REWRITE_JOB_OPTIONS,
        workspaceId: data.workspaceId,
        isWorkspaceJob: true,
      },
    );
  }

  async rewriteThreadGrantsInTransaction({
    transactionScope,
    workspaceId,
    threadIds,
    affectedChannelIds,
  }: {
    transactionScope: WorkspaceTransactionScope;
    workspaceId: string;
    threadIds: string[];
    affectedChannelIds: (string | null | undefined)[];
  }): Promise<void> {
    if (!isNonEmptyArray(threadIds)) {
      return;
    }

    await acquireAgentChatChannelGrantLocksForThreadWriteOrThrow({
      transactionScope,
      workspaceId,
      channelIds: affectedChannelIds,
    });

    await this.replaceRuleGrantsInTransaction({
      transactionScope,
      workspaceId,
      scope: { threadIds },
    });
  }

  async rewriteChannelGrants({
    workspaceId,
    channelId,
  }: {
    workspaceId: string;
    channelId: string;
  }): Promise<void> {
    await this.workspaceOrmManager.executeTransactionInWorkspaceContext(
      async (transactionScope) => {
        await acquireAgentChatChannelGrantLocks({
          transactionScope,
          workspaceId,
          channelIds: [channelId],
          mode: 'exclusive',
        });

        await this.replaceRuleGrantsInTransaction({
          transactionScope,
          workspaceId,
          scope: { channelId },
        });
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  async rewriteAllChannelGrants({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const channels = await this.channelRepository.find(workspaceId, {
      select: { id: true },
      order: { id: 'ASC' },
    });

    for (const { id: channelId } of channels) {
      await this.rewriteChannelGrants({ workspaceId, channelId });
    }
  }

  async replaceRuleGrantsInTransaction({
    transactionScope,
    workspaceId,
    scope,
  }: {
    transactionScope: WorkspaceTransactionScope;
    workspaceId: string;
    scope: AgentChatChannelGrantScope;
  }): Promise<void> {
    if ('threadIds' in scope && !isNonEmptyArray(scope.threadIds)) {
      return;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const threadObjectMetadata = findAgentChatFlatObjectMetadata(
      flatObjectMetadataMaps,
      'agentChatThread',
    );

    if (!isDefined(threadObjectMetadata)) {
      return;
    }

    const threadRepository =
      transactionScope.getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
        'agentChatThread',
        { shouldSkipEventEmission: true },
      );

    const scopeThreads = await threadRepository.find({
      select: ['id', 'channelId'],
      where:
        'threadIds' in scope
          ? { id: Any(scope.threadIds) }
          : { channelId: scope.channelId },
      withDeleted: true,
    });
    const ruleRoleIdsByChannelId = await this.findRuleRoleIdsByChannelId({
      workspaceId,
      channelIds: scopeThreads
        .map(({ channelId }) => channelId)
        .filter(isDefined),
    });

    await this.recordShareSystemWriteService.syncRuleRecordShares({
      workspaceId,
      objectMetadataId: threadObjectMetadata.id,
      scope:
        'threadIds' in scope
          ? { recordIds: scope.threadIds }
          : { sourceId: scope.channelId },
      ruleGrants: buildAgentChatChannelRuleGrants({
        threads: scopeThreads,
        ruleRoleIdsByChannelId,
      }),
      principalType: RecordSharePrincipalType.ROLE,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      transactionScope,
    });
  }

  private async findRuleRoleIdsByChannelId({
    workspaceId,
    channelIds,
  }: {
    workspaceId: string;
    channelIds: string[];
  }): Promise<Map<string, Set<string>>> {
    const uniqueChannelIds = [...new Set(channelIds)];

    if (!isNonEmptyArray(uniqueChannelIds)) {
      return new Map();
    }

    const channels = await this.channelRepository.find(workspaceId, {
      select: { id: true },
      where: { id: In(uniqueChannelIds) },
    });
    const rolesWithAllChannelsAccess = await this.roleRepository.find(
      workspaceId,
      {
        select: { id: true },
        where: { canAccessAllAgentChatChannels: true },
      },
    );
    const channelRoles = await this.channelRoleRepository.find(workspaceId, {
      select: { channelId: true, roleId: true },
      where: { channelId: In(uniqueChannelIds) },
    });

    const allChannelsRoleIds = rolesWithAllChannelsAccess.map(({ id }) => id);
    const ruleRoleIdsByChannelId = new Map(
      channels.map(({ id }) => [id, new Set(allChannelsRoleIds)]),
    );

    for (const { channelId, roleId } of channelRoles) {
      ruleRoleIdsByChannelId.get(channelId)?.add(roleId);
    }

    return ruleRoleIdsByChannelId;
  }
}
