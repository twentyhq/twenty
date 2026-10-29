import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findAwaitingPausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool.util';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { buildEndWaitingAgentTurnQuery } from 'src/engine/metadata-modules/ai/ai-history/utils/build-end-waiting-agent-turn-query.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class ToolCallAnswerRecorderService {
  constructor(
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly participantService: AgentChatThreadParticipantService,
  ) {}

  async findAwaitingToolParts({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<
    Pick<AgentMessagePartWorkspaceEntity, 'id' | 'toolName' | 'toolOutput'>[]
  > {
    const parts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId },
      select: ['id', 'toolName', 'toolOutput'],
    });

    return parts.filter((part) => isDefined(findAwaitingPausingTool(part)));
  }

  // only a still-pending call is claimed, so two answers never both run it
  async claimToolCallAnswerOrThrow({
    threadId,
    partId,
    toolOutput,
    workspaceId,
    workspaceMemberId,
  }: {
    threadId: string;
    partId: string;
    toolOutput: Record<string, unknown>;
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<void> {
    await this.participantService.resolveMention({
      threadId,
      workspaceId,
      workspaceMemberId,
      writeResponse: async ({ manager, table }) => {
        const claimedParts = await manager.query<{ id: string }[]>(
          `WITH claimed_part AS (UPDATE ${table('agentMessagePart')} SET "toolOutput" = "toolOutput" || $2::jsonb, "updatedAt" = now()
           WHERE id = $1 AND "toolOutput"->'result'->>'status' = 'pending' RETURNING id) SELECT id FROM claimed_part`,
          [partId, JSON.stringify(toolOutput)],
        );

        if (claimedParts.length !== 1) {
          throw new AiException(
            'This tool call is no longer waiting for an answer',
            AiExceptionCode.TOOL_CALL_NOT_PENDING,
          );
        }
      },
    });
  }

  // written together so an answer never strands a conversation waiting on answered calls
  async recordToolCallAnswer({
    threadId,
    messageId,
    partId,
    toolOutput,
    isLastAnswer,
    workspaceId,
    resolveMentionForWorkspaceMemberId,
  }: {
    threadId: string;
    messageId: string;
    partId: string;
    toolOutput: Record<string, unknown>;
    isLastAnswer: boolean;
    workspaceId: string;
    resolveMentionForWorkspaceMemberId: string | null;
  }): Promise<void> {
    let isPendingQuestionCleared = false;

    const writeResponse = async ({
      manager,
      table,
    }: AgentHistoryStorageContext) => {
      await manager.query(
        `UPDATE ${table('agentMessagePart')} SET "toolOutput" = $2::jsonb, "updatedAt" = now() WHERE id = $1`,
        [partId, JSON.stringify(toolOutput)],
      );

      if (!isLastAnswer) {
        return;
      }

      const clearedThreads = await manager.query<{ id: string }[]>(
        `WITH cleared AS (
           UPDATE ${table('agentChatThread')} SET "pendingQuestionMessageId" = NULL, "updatedAt" = now()
           WHERE id = $1 AND "pendingQuestionMessageId" = $2
           RETURNING id
         ) SELECT id FROM cleared`,
        [threadId, messageId],
      );

      if (clearedThreads.length === 0) {
        return;
      }

      await manager.query(buildEndWaitingAgentTurnQuery({ table }), [
        messageId,
        AgentTurnStatus.COMPLETED,
      ]);

      isPendingQuestionCleared = true;
    };

    if (isDefined(resolveMentionForWorkspaceMemberId)) {
      await this.participantService.resolveMention({
        workspaceId,
        workspaceMemberId: resolveMentionForWorkspaceMemberId,
        threadId,
        writeResponse,
      });
    } else {
      await this.messagePartRepository.query(workspaceId, writeResponse);
    }

    if (isPendingQuestionCleared) {
      await this.threadRecordEventService.emitPendingQuestionCleared({
        workspaceId,
        threadId,
        messageId,
      });
    }
  }
}
