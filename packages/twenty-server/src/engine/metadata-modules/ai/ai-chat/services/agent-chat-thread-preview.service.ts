import { Injectable } from '@nestjs/common';

import { type AgentChatThreadPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-preview.dto';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

const PREVIEW_TEXT_MAX_LENGTH = 280;

@Injectable()
export class AgentChatThreadPreviewService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
  ) {}

  // A user message without a sender predates multiplayer chats, when every
  // user message was the owner's
  async findForThreads({
    workspaceId,
    workspaceMemberId,
    threadIds,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    threadIds: string[];
  }): Promise<AgentChatThreadPreviewDTO[]> {
    const readableThreadIds = await this.sharingService.findReadableThreadIds({
      workspaceId,
      workspaceMemberId,
      threadIds,
    });

    if (readableThreadIds.length === 0) {
      return [];
    }

    return this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query<AgentChatThreadPreviewDTO[]>(
        `WITH thread AS (
           SELECT id, "workspaceMemberId"
           FROM ${table('agentChatThread')}
           WHERE id = ANY($1)
         ), visible_message AS (
           SELECT message.id, message."threadId", message.role, message."createdAt",
             CASE WHEN message.role = 'user'
               THEN COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")
             END AS "senderWorkspaceMemberId"
           FROM ${table('agentMessage')} message
           JOIN thread ON thread.id = message."threadId"
           WHERE message."deletedAt" IS NULL
             AND message."isHidden" = false
             AND message.role IN ('user', 'assistant')
         ), last_message AS (
           SELECT DISTINCT ON ("threadId") *
           FROM visible_message
           ORDER BY "threadId", "createdAt" DESC
         ), last_text AS (
           SELECT DISTINCT ON (part."messageId") part."messageId", part."textContent"
           FROM ${table('agentMessagePart')} part
           JOIN last_message ON last_message.id = part."messageId"
           WHERE part.type = 'text' AND btrim(coalesce(part."textContent", '')) <> ''
           ORDER BY part."messageId", part."orderIndex" DESC
         ), member AS (
           SELECT "threadId", array_agg(DISTINCT "senderWorkspaceMemberId") AS "memberIds"
           FROM visible_message
           WHERE "senderWorkspaceMemberId" IS NOT NULL
           GROUP BY "threadId"
         )
         SELECT thread.id AS "threadId",
           last_message.role AS "lastMessageRole",
           left(last_text."textContent", $2) AS "lastMessageText",
           last_message."senderWorkspaceMemberId" AS "lastMessageSenderWorkspaceMemberId",
           COALESCE(member."memberIds", ARRAY[]::uuid[]) AS "memberIds"
         FROM thread
         LEFT JOIN last_message ON last_message."threadId" = thread.id
         LEFT JOIN last_text ON last_text."messageId" = last_message.id
         LEFT JOIN member ON member."threadId" = thread.id`,
        [readableThreadIds, PREVIEW_TEXT_MAX_LENGTH],
      ),
    );
  }
}
