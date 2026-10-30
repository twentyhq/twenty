import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

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
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

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
      async ({ manager, table }) => {
        await this.assertMembersAvailableOrThrow({
          manager,
          workspaceId,
          pair,
        });

        const [createdThread] = await manager.query<{ id: string }[]>(
          `INSERT INTO ${table('agentChatThread')}
            ("conversationType", "directMessageFirstWorkspaceMemberId", "directMessageSecondWorkspaceMemberId", "isAssistantParticipant")
           VALUES ('DIRECT_MESSAGE', $1, $2, false)
           ON CONFLICT ("directMessageFirstWorkspaceMemberId", "directMessageSecondWorkspaceMemberId")
             WHERE "directMessageFirstWorkspaceMemberId" IS NOT NULL
             DO NOTHING
           RETURNING id`,
          [
            pair.directMessageFirstWorkspaceMemberId,
            pair.directMessageSecondWorkspaceMemberId,
          ],
        );

        return createdThread?.id;
      },
    );

    return (
      createdThreadId ??
      (await this.findThreadId({ workspaceId, pair })) ??
      throwAgentChatThreadNotFound()
    );
  }

  // TODO(@bosiraphael): remove once 2.54 leaves the cross-upgrade window
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
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const members = await manager.query<{ id: string }[]>(
      `SELECT member.id FROM ${schema}."workspaceMember" member
       JOIN core."userWorkspace" membership
         ON membership."userId" = member."userId"
        AND membership."workspaceId" = $1
        AND membership."deletedAt" IS NULL
       WHERE member.id = ANY($2::uuid[])
         AND member."deletedAt" IS NULL
       ORDER BY member.id
       FOR SHARE OF member, membership`,
      [workspaceId, workspaceMemberIds],
    );

    if (members.length !== workspaceMemberIds.length) {
      throwAgentChatThreadNotFound();
    }
  }
}
