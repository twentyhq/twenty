import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import {
  NO_REPLY_TOOL_NAME,
  type AgentChatThreadRowMetadata,
} from 'twenty-shared/ai';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getAgentChatThreadRowMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-row-metadata.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const TURN_SELECTION = {
  id: true,
  threadId: true,
  agentId: true,
  modelId: true,
  status: true,
  error: true,
  createdAt: true,
  endedAt: true,
  createdBy: true,
};

@Injectable()
export class AgentChatThreadRowMetadataService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async find(threadIds: string[]): Promise<AgentChatThreadRowMetadata[]> {
    if (!isNonEmptyArray(threadIds)) {
      return [];
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const threads = await this.workspaceOrmManager
        .getRepository<AgentChatThreadWorkspaceEntity>('agentChatThread')
        .find({
          where: { id: In([...new Set(threadIds)]) },
          select: ['id', 'lastActivityAt', 'pendingQuestionMessageId'],
        });

      if (!isNonEmptyArray(threads)) {
        return [];
      }

      const readableThreadIds = threads.map(({ id }) => id);
      const messageRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<AgentMessageWorkspaceEntity>(
          'agentMessage',
        );
      const turnRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<AgentTurnWorkspaceEntity>(
          'agentTurn',
        );
      const messagePartRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<AgentMessagePartWorkspaceEntity>(
          'agentMessagePart',
        );
      const successfulNoReply = messagePartRepository
        .createQueryBuilder('silentPart')
        .select('silentPart.id')
        .where('silentPart.messageId = message.id')
        .andWhere(
          'silentPart.toolName = :successfulNoReplyToolName AND silentPart.state = :successfulNoReplyState',
          {
            successfulNoReplyToolName: NO_REPLY_TOOL_NAME,
            successfulNoReplyState: 'output-available',
          },
        )
        .andWhere('silentPart.toolOutput @> :silentSuccess', {
          silentSuccess: JSON.stringify({ success: true }),
        });
      const visiblePart = messagePartRepository
        .createQueryBuilder('visiblePart')
        .select('visiblePart.id')
        .where('visiblePart.messageId = message.id')
        .andWhere(
          `(visiblePart.toolName IS NULL OR visiblePart.toolName <> :silentToolName)
          AND visiblePart.type NOT IN (:...silentHiddenPartTypes)
          AND (visiblePart.type <> :silentTextPartType OR COALESCE(visiblePart.textContent, '') <> '')`,
          {
            silentToolName: NO_REPLY_TOOL_NAME,
            silentHiddenPartTypes: ['step-start', 'reasoning'],
            silentTextPartType: 'text',
          },
        );
      const [messages, latestTurns] = await Promise.all([
        messageRepository
          .createQueryBuilder('message')
          .setFindOptions({
            select: {
              id: true,
              threadId: true,
              turnId: true,
              role: true,
              senderWorkspaceMemberId: true,
              senderApplicationId: true,
              createdAt: true,
              processedAt: true,
            },
          })
          .where({
            threadId: In(readableThreadIds),
            role: In([AgentMessageRole.USER, AgentMessageRole.ASSISTANT]),
            status: AgentMessageStatus.SENT,
          })
          .andWhere(
            `(message.role <> :assistantRole OR NOT EXISTS (${successfulNoReply.getQuery()}) OR EXISTS (${visiblePart.getQuery()}))`,
            {
              assistantRole: AgentMessageRole.ASSISTANT,
              ...successfulNoReply.getParameters(),
              ...visiblePart.getParameters(),
            },
          )
          .distinctOn(['message.threadId'])
          .orderBy('message.threadId', 'ASC')
          .addOrderBy('message.createdAt', 'DESC')
          .addOrderBy('message.id', 'DESC')
          .getMany<AgentMessageWorkspaceEntity>(),
        turnRepository
          .createQueryBuilder('turn')
          .setFindOptions({ select: TURN_SELECTION })
          .where({ threadId: In(readableThreadIds) })
          .distinctOn(['turn.threadId'])
          .orderBy('turn.threadId', 'ASC')
          .addOrderBy('turn.createdAt', 'DESC')
          .addOrderBy('turn.id', 'DESC')
          .getMany<AgentTurnWorkspaceEntity>(),
      ]);
      const messageTurnIds = [
        ...new Set(messages.map(({ turnId }) => turnId).filter(isDefined)),
      ];
      const messageTurns = isNonEmptyArray(messageTurnIds)
        ? await turnRepository.find({
            where: { id: In(messageTurnIds), threadId: In(readableThreadIds) },
            select: TURN_SELECTION,
          })
        : [];
      const messageIds = messages.map(({ id }) => id);
      const previewParts = isNonEmptyArray(messageIds)
        ? await messagePartRepository.find({
            where: { messageId: In(messageIds), type: 'text' },
            select: ['messageId', 'orderIndex', 'textContent'],
            order: { orderIndex: 'ASC' },
          })
        : [];
      const previewByMessageId = new Map<string, string[]>();

      for (const part of previewParts) {
        if (!isNonEmptyString(part.textContent)) {
          continue;
        }
        const texts = previewByMessageId.get(part.messageId) ?? [];
        texts.push(part.textContent);
        previewByMessageId.set(part.messageId, texts);
      }
      const messageByThreadId = new Map(
        messages.map((message) => [message.threadId, message]),
      );
      const latestTurnByThreadId = new Map(
        latestTurns.map((turn) => [turn.threadId, turn]),
      );
      const messageTurnById = new Map(
        messageTurns.map((turn) => [turn.id, turn]),
      );

      return threads.map((thread) => {
        const message = messageByThreadId.get(thread.id);

        return getAgentChatThreadRowMetadata({
          thread,
          message,
          messageTurn: isDefined(message?.turnId)
            ? messageTurnById.get(message.turnId)
            : undefined,
          latestTurn: latestTurnByThreadId.get(thread.id),
          previewText: isDefined(message)
            ? (previewByMessageId.get(message.id)?.join('\n\n') ?? null)
            : null,
        });
      });
    });
  }
}
