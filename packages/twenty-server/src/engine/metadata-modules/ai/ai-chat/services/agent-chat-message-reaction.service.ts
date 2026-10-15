import { Injectable, Logger } from '@nestjs/common';

import {
  type AgentMessageReactionSummary,
  isValidAgentMessageReactionEmoji,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { getAgentMessageReactionTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-message-reaction-table.util';
import { throwAgentChatMessageNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-message-not-found.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryWorkspaceStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type AgentMessageReactionArgs = {
  messageId: string;
  emoji: string;
  workspaceMemberId: string;
  workspaceId: string;
};

type AgentMessageReactionSummaryRow = AgentMessageReactionSummary & {
  messageId: string;
};

type BuildReactionWriteQuery = (reactionTable: string) => string;

// Both return how many rows changed, so a repeated call is a no-op that sends
// nothing
const buildAddReactionQuery: BuildReactionWriteQuery = (reactionTable) =>
  `WITH inserted AS (
     INSERT INTO ${reactionTable} ("messageId", "workspaceMemberId", emoji)
     VALUES ($1, $2, $3)
     ON CONFLICT ("messageId", "workspaceMemberId", emoji) WHERE "deletedAt" IS NULL DO NOTHING
     RETURNING id
   )
   SELECT COUNT(*)::int AS "changedCount" FROM inserted`;

const buildRemoveReactionQuery: BuildReactionWriteQuery = (reactionTable) =>
  `WITH deleted AS (
     DELETE FROM ${reactionTable}
     WHERE "messageId" = $1 AND "workspaceMemberId" = $2 AND emoji = $3
     RETURNING id
   )
   SELECT COUNT(*)::int AS "changedCount" FROM deleted`;

// Reactions are written in SQL, outside the ORM, and sent to the chat's
// viewers only: they are not record events, not model context and not
// thread activity
@Injectable()
export class AgentChatMessageReactionService {
  private readonly logger = new Logger(AgentChatMessageReactionService.name);

  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly storageService: AgentHistoryWorkspaceStorageService,
    private readonly sharingService: AgentChatSharingService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  addReaction(
    args: AgentMessageReactionArgs,
  ): Promise<AgentMessageReactionSummary[]> {
    return this.writeReaction(args, buildAddReactionQuery);
  }

  removeReaction(
    args: AgentMessageReactionArgs,
  ): Promise<AgentMessageReactionSummary[]> {
    return this.writeReaction(args, buildRemoveReactionQuery);
  }

  // One query for every message shown, however many there are
  async findReactionsByMessageId({
    workspaceId,
    messageIds,
  }: {
    workspaceId: string;
    messageIds: string[];
  }): Promise<Map<string, AgentMessageReactionSummary[]>> {
    if (
      messageIds.length === 0 ||
      !(await this.isReactionObjectProvisioned(workspaceId))
    ) {
      return new Map();
    }

    return this.findReactionSummaries({
      manager: this.storageService.getContext(workspaceId).manager,
      workspaceId,
      messageIds,
    });
  }

  private async writeReaction(
    {
      messageId,
      emoji,
      workspaceMemberId,
      workspaceId,
    }: AgentMessageReactionArgs,
    buildQuery: BuildReactionWriteQuery,
  ): Promise<AgentMessageReactionSummary[]> {
    if (!isValidAgentMessageReactionEmoji(emoji)) {
      throw new AiException(
        'A reaction must contain an emoji, no whitespace and at most 32 characters',
        AiExceptionCode.INVALID_CHAT_MESSAGE_REACTION_EMOJI,
      );
    }

    const message = await this.messageRepository.findOne(workspaceId, {
      where: { id: messageId },
      select: ['id', 'threadId', 'role'],
    });

    // Contexts given to the model are never shown, so cannot be reacted to
    if (!isDefined(message) || message.role === AgentMessageRole.SYSTEM) {
      return throwAgentChatMessageNotFound();
    }

    await this.sharingService.getReadableThread({
      threadId: message.threadId,
      workspaceMemberId,
      workspaceId,
    });

    // The object is created by an upgrade command, which may not have reached
    // this workspace yet
    if (!(await this.isReactionObjectProvisioned(workspaceId))) {
      return throwAgentChatMessageNotFound();
    }

    const { changedCount, reactions } = await this.storageService.run(
      workspaceId,
      async ({ manager, table }) => {
        // Serializes the reactions to one message, so each change reads every
        // change committed before it and the last one sent is complete
        const lockedMessages = await manager.query<{ id: string }[]>(
          `SELECT id FROM ${table('agentMessage')} WHERE id = $1 FOR NO KEY UPDATE`,
          [messageId],
        );

        if (lockedMessages.length === 0) {
          return throwAgentChatMessageNotFound();
        }

        const [{ changedCount }] = await manager.query<
          { changedCount: number }[]
        >(buildQuery(getAgentMessageReactionTable(workspaceId)), [
          messageId,
          workspaceMemberId,
          emoji,
        ]);

        const reactionsByMessageId = await this.findReactionSummaries({
          manager,
          workspaceId,
          messageIds: [messageId],
        });

        return {
          changedCount,
          reactions: reactionsByMessageId.get(messageId) ?? [],
        };
      },
    );

    if (changedCount > 0) {
      await this.publishReactionsUpdated({
        threadId: message.threadId,
        messageId,
        reactions,
        workspaceId,
      });
    }

    return reactions;
  }

  private async findReactionSummaries({
    manager,
    workspaceId,
    messageIds,
  }: {
    manager: EntityManager;
    workspaceId: string;
    messageIds: string[];
  }): Promise<Map<string, AgentMessageReactionSummary[]>> {
    const rows = await manager.query<AgentMessageReactionSummaryRow[]>(
      `SELECT "messageId", emoji,
         array_agg("workspaceMemberId" ORDER BY "createdAt", "workspaceMemberId") AS "workspaceMemberIds"
       FROM ${getAgentMessageReactionTable(workspaceId)}
       WHERE "messageId" = ANY($1::uuid[]) AND "deletedAt" IS NULL
       GROUP BY "messageId", emoji
       ORDER BY "messageId", MIN("createdAt"), emoji`,
      [messageIds],
    );

    const reactionsByMessageId = new Map<
      string,
      AgentMessageReactionSummary[]
    >();

    for (const { messageId, emoji, workspaceMemberIds } of rows) {
      const reactions = reactionsByMessageId.get(messageId) ?? [];

      reactions.push({ emoji, workspaceMemberIds });
      reactionsByMessageId.set(messageId, reactions);
    }

    return reactionsByMessageId;
  }

  private async isReactionObjectProvisioned(
    workspaceId: string,
  ): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return isDefined(
      findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentMessageReaction',
      ),
    );
  }

  // Sent once the write has committed, so a failure here must not report the
  // write itself as failed
  private async publishReactionsUpdated({
    threadId,
    messageId,
    reactions,
    workspaceId,
  }: {
    threadId: string;
    messageId: string;
    reactions: AgentMessageReactionSummary[];
    workspaceId: string;
  }): Promise<void> {
    try {
      await this.eventPublisherService.publish({
        threadId,
        workspaceId,
        event: { type: 'message-reactions-updated', messageId, reactions },
      });
    } catch (error) {
      this.logger.error(
        `Could not send the reactions of chat message ${messageId} in workspace ${workspaceId}`,
        error,
      );
    }
  }
}
