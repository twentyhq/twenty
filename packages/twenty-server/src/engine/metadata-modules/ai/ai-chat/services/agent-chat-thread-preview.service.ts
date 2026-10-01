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
        `SELECT thread.id AS "threadId",
           last_message.role AS "lastMessageRole",
           left(last_text."textContent", $2) AS "lastMessageText",
           last_message."senderWorkspaceMemberId" AS "lastMessageSenderWorkspaceMemberId",
           COALESCE(member."memberIds", ARRAY[]::uuid[]) AS "memberIds"
         FROM ${table('agentChatThread')} thread
         LEFT JOIN LATERAL (
           SELECT message.id, message.role,
             CASE WHEN message.role = 'user'
               THEN COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")
             END AS "senderWorkspaceMemberId"
           FROM ${table('agentMessage')} message
           WHERE message."threadId" = thread.id
             AND message."deletedAt" IS NULL
             AND message."isHidden" = false
             AND message.role IN ('user', 'assistant')
           ORDER BY message."createdAt" DESC, message.id DESC
           LIMIT 1
         ) last_message ON true
         LEFT JOIN LATERAL (
           SELECT part."textContent"
           FROM ${table('agentMessagePart')} part
           WHERE part."messageId" = last_message.id
             AND part.type = 'text'
             AND btrim(coalesce(part."textContent", '')) <> ''
           ORDER BY part."orderIndex" DESC
           LIMIT 1
         ) last_text ON true
         LEFT JOIN LATERAL (
           SELECT array_remove(
             array_agg(DISTINCT COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")),
             NULL
           ) AS "memberIds"
           FROM ${table('agentMessage')} message
           WHERE message."threadId" = thread.id
             AND message."deletedAt" IS NULL
             AND message."isHidden" = false
             AND message.role = 'user'
         ) member ON true
         WHERE thread.id = ANY($1)`,
        [readableThreadIds, PREVIEW_TEXT_MAX_LENGTH],
      ),
    );
  }
}
