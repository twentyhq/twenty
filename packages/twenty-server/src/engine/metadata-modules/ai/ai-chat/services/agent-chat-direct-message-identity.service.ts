import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { normalizeAgentChatDirectMessagePairOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/normalize-agent-chat-direct-message-pair-or-throw.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type DirectMessagePair = ReturnType<
  typeof normalizeAgentChatDirectMessagePairOrThrow
>;

@Injectable()
export class AgentChatDirectMessageIdentityService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getOrCreate({
    workspaceId,
    ...members
  }: {
    workspaceId: string;
    firstWorkspaceMemberId: string;
    secondWorkspaceMemberId: string;
  }): Promise<string> {
    const pair = normalizeAgentChatDirectMessagePairOrThrow(members);

    await this.assertStorageAvailableOrThrow(workspaceId);

    const existingThreadId = await this.findThreadId({ workspaceId, pair });

    if (isDefined(existingThreadId)) {
      return existingThreadId;
    }

    const createdThreadId = await this.threadRepository.query(
      workspaceId,
      async ({ manager }) => {
        await this.assertMembersAvailableOrThrow({
          manager,
          workspaceId,
          pair,
        });

        const { raw: createdThreads }: { raw: { id: string }[] } = await manager
          .createQueryBuilder()
          .insert()
          .into(`${getWorkspaceSchemaName(workspaceId)}.agentChatThread`)
          .values({
            conversationType: 'DIRECT_MESSAGE',
            ...pair,
            isAssistantParticipant: false,
          })
          .orIgnore()
          .returning('id')
          .execute();

        return createdThreads[0]?.id;
      },
    );

    return (
      createdThreadId ??
      (await this.findThreadId({ workspaceId, pair })) ??
      throwAgentChatThreadNotFound()
    );
  }

  // TODO(@bosiraphael): remove once 2.55 leaves the cross-upgrade window
  private async assertStorageAvailableOrThrow(
    workspaceId: string,
  ): Promise<void> {
    const { flatIndexMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatIndexMaps'],
    );

    if (
      !isDefined(
        flatIndexMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.indexes.directMessagePairUniqueIndex
            .universalIdentifier
        ],
      )
    ) {
      throw new AiException(
        'Direct messages are unavailable until this workspace finishes upgrading',
        AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
      );
    }
  }

  private async findThreadId({
    workspaceId,
    pair,
  }: {
    workspaceId: string;
    pair: DirectMessagePair;
  }): Promise<string | undefined> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: pair,
      select: ['id'],
    });

    return thread?.id;
  }

  private async assertMembersAvailableOrThrow({
    manager,
    workspaceId,
    pair,
  }: Pick<AgentHistoryStorageContext, 'manager'> & {
    workspaceId: string;
    pair: DirectMessagePair;
  }): Promise<void> {
    const workspaceMemberIds = [
      pair.directMessageFirstWorkspaceMemberId,
      pair.directMessageSecondWorkspaceMemberId,
    ];
    const members = await manager
      .createQueryBuilder()
      .select('member.id', 'id')
      .from(`${getWorkspaceSchemaName(workspaceId)}.workspaceMember`, 'member')
      .innerJoin(
        UserWorkspaceEntity,
        'membership',
        'membership.userId = member."userId"',
      )
      .where('membership.workspaceId = :workspaceId', { workspaceId })
      .andWhere('member.id IN (:...workspaceMemberIds)', { workspaceMemberIds })
      .andWhere('member."deletedAt" IS NULL')
      .orderBy('member.id', 'ASC')
      .setLock('pessimistic_read', undefined, ['member', 'membership'])
      .getRawMany<{ id: string }>();

    if (members.length !== workspaceMemberIds.length) {
      throwAgentChatThreadNotFound();
    }
  }
}
