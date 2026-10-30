import { Inject, Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { normalizeAgentChatDirectMessagePairOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/normalize-agent-chat-direct-message-pair-or-throw.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import {
  type AgentHistoryStorageContext,
  AgentHistoryWorkspaceStorageService,
} from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class AgentChatDirectMessageIdentityService {
  @Inject(AgentHistoryWorkspaceStorageService)
  private readonly storageService: AgentHistoryWorkspaceStorageService;

  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  async getOrCreate({
    workspaceId,
    ...members
  }: {
    workspaceId: string;
    firstWorkspaceMemberId: string;
    secondWorkspaceMemberId: string;
  }): Promise<string> {
    if (!isValidUuid(workspaceId)) {
      throw new AiException(
        'Direct messages require a valid workspace ID',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const pair = normalizeAgentChatDirectMessagePairOrThrow(members);

    await this.assertStorageAvailableOrThrow(workspaceId);

    return this.storageService.run(workspaceId, async (context) => {
      const existingThreadId = await this.findThreadId({ ...context, pair });

      if (isDefined(existingThreadId)) {
        return existingThreadId;
      }

      await this.assertMembersAvailableOrThrow({
        ...context,
        workspaceId,
        pair,
      });

      const [createdThread] = await context.manager.query<{ id: string }[]>(
        `INSERT INTO ${context.table('agentChatThread')}
          (id, "conversationType", "directMessageFirstWorkspaceMemberId", "directMessageSecondWorkspaceMemberId", "isAssistantParticipant")
         VALUES ($1, 'DIRECT_MESSAGE', $2, $3, false)
         ON CONFLICT ("directMessageFirstWorkspaceMemberId", "directMessageSecondWorkspaceMemberId") DO NOTHING
         RETURNING id`,
        [
          randomUUID(),
          pair.directMessageFirstWorkspaceMemberId,
          pair.directMessageSecondWorkspaceMemberId,
        ],
      );

      if (isDefined(createdThread)) {
        return createdThread.id;
      }

      return (
        (await this.findThreadId({ ...context, pair })) ??
        throwAgentChatThreadNotFound()
      );
    });
  }

  private async assertStorageAvailableOrThrow(
    workspaceId: string,
  ): Promise<void> {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const { fields, indexes } = STANDARD_OBJECTS.agentChatThread;
    const hasPairFields = [
      fields.conversationType,
      fields.directMessageFirstWorkspaceMemberId,
      fields.directMessageSecondWorkspaceMemberId,
    ].every(({ universalIdentifier }) =>
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
      ),
    );
    const hasPairIndex = isDefined(
      flatIndexMaps.byUniversalIdentifier[
        indexes.directMessagePairUniqueIndex.universalIdentifier
      ],
    );

    if (hasPairFields && hasPairIndex) {
      return;
    }

    throw new AiException(
      'Direct messages are unavailable until this workspace finishes upgrading',
      AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
    );
  }

  private async findThreadId({
    manager,
    table,
    pair,
  }: AgentHistoryStorageContext & {
    pair: ReturnType<typeof normalizeAgentChatDirectMessagePairOrThrow>;
  }): Promise<string | undefined> {
    const [thread] = await manager.query<{ id: string }[]>(
      `SELECT id FROM ${table('agentChatThread')}
       WHERE "conversationType" = 'DIRECT_MESSAGE'
         AND "directMessageFirstWorkspaceMemberId" = $1
         AND "directMessageSecondWorkspaceMemberId" = $2`,
      [
        pair.directMessageFirstWorkspaceMemberId,
        pair.directMessageSecondWorkspaceMemberId,
      ],
    );

    return thread?.id;
  }

  private async assertMembersAvailableOrThrow({
    manager,
    workspaceId,
    pair,
  }: Pick<AgentHistoryStorageContext, 'manager'> & {
    workspaceId: string;
    pair: ReturnType<typeof normalizeAgentChatDirectMessagePairOrThrow>;
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
