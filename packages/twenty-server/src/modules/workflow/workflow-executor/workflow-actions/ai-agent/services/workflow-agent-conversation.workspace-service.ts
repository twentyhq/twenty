import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { convertToModelMessages, type ModelMessage } from 'ai';
import { type ExtendedUIMessage, type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  type AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapAiStepsToUiMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-ui-message-parts.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartsToUIMessageParts';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { findPendingQuestionPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-pending-question-part.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { hasWorkflowRunThreadFields } from 'src/engine/metadata-modules/ai/ai-history/utils/has-workflow-run-thread-fields.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

type RecordedExecutionResult = Pick<AgentExecutionResult, 'steps' | 'isPaused'>;

export type RecordedConversation = {
  threadId: string;
  isAwaitingAnswer: boolean;
};

// Each execution of an agent step gets its own conversation, so a loop
// iteration or a retry never reads or continues another one's messages. The
// conversation has no owner: it belongs to the run and is readable by whoever
// can read the run.
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async recordExecution({
    workspaceId,
    workflowRunId,
    stepId,
    title,
    agentId,
    prompt,
    initiatorUserWorkspaceId,
    executionResult,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    title: string;
    agentId: string | null;
    prompt: string;
    initiatorUserWorkspaceId: string | null;
    // Absent when the agent failed before replying; the prompt is still
    // recorded so the run shows what the agent was asked.
    executionResult?: RecordedExecutionResult;
  }): Promise<RecordedConversation | null> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    if (!hasWorkflowRunThreadFields(flatFieldMetadataMaps)) {
      return null;
    }

    const threadId = randomUUID();

    await this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `INSERT INTO ${table('agentChatThread')} (id, title, "workflowRunId", "workflowStepId")
         VALUES ($1, $2, $3, $4)`,
        [threadId, title, workflowRunId, stepId],
      ),
    );

    const turnId = await this.insertTurn({ workspaceId, threadId, agentId });

    await this.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.USER,
      agentId: null,
      senderUserWorkspaceId: initiatorUserWorkspaceId,
      parts: [{ type: 'text', text: prompt }],
    });

    const isAwaitingAnswer = await this.recordReply({
      workspaceId,
      threadId,
      turnId,
      agentId,
      executionResult,
    });

    await this.workflowRunWorkspaceService.setStepThreadId({
      stepId,
      threadId,
      workflowRunId,
      workspaceId,
    });

    return { threadId, isAwaitingAnswer };
  }

  // Continues a conversation whose question has been answered: the answer is
  // already recorded as the last message, so only the agent's reply is added.
  async recordContinuation({
    workspaceId,
    threadId,
    agentId,
    executionResult,
  }: {
    workspaceId: string;
    threadId: string;
    agentId: string | null;
    executionResult?: RecordedExecutionResult;
  }): Promise<RecordedConversation> {
    const turnId = await this.insertTurn({ workspaceId, threadId, agentId });

    const isAwaitingAnswer = await this.recordReply({
      workspaceId,
      threadId,
      turnId,
      agentId,
      executionResult,
    });

    return { threadId, isAwaitingAnswer };
  }

  async loadModelMessages({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<ModelMessage[]> {
    const messages = await this.messageRepository.find(workspaceId, {
      where: { threadId },
      order: {
        processedAt: { direction: 'ASC', nulls: 'LAST' },
        createdAt: 'ASC',
      },
      relations: ['parts'],
    });

    const uiMessages: ExtendedUIMessage[] = messages.map((message) => ({
      id: message.id,
      role: message.role as ExtendedUIMessage['role'],
      parts: finalizeDanglingToolParts(
        mapDBPartsToUIMessageParts(message.parts ?? []),
      ),
    }));

    return convertToModelMessages(uiMessages);
  }

  private async recordReply({
    workspaceId,
    threadId,
    turnId,
    agentId,
    executionResult,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    agentId: string | null;
    executionResult?: RecordedExecutionResult;
  }): Promise<boolean> {
    const replyParts = mapAiStepsToUiMessageParts(executionResult?.steps ?? []);

    if (replyParts.length === 0) {
      return false;
    }

    const messageId = await this.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId,
      senderUserWorkspaceId: null,
      parts: replyParts,
    });

    if (
      executionResult?.isPaused !== true ||
      !isDefined(findPendingQuestionPart(replyParts))
    ) {
      return false;
    }

    // The same marker a chat question sets, so the answer flow can claim the
    // question exactly once.
    await this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `UPDATE ${table('agentChatThread')} SET "pendingQuestionMessageId" = $2 WHERE id = $1`,
        [threadId, messageId],
      ),
    );

    return true;
  }

  private async insertTurn({
    workspaceId,
    threadId,
    agentId,
  }: {
    workspaceId: string;
    threadId: string;
    agentId: string | null;
  }): Promise<string> {
    const turnInsertResult = await this.turnRepository.insert(workspaceId, {
      threadId,
      agentId,
    });

    return turnInsertResult.identifiers[0].id as string;
  }

  private async insertMessage({
    workspaceId,
    threadId,
    turnId,
    role,
    agentId,
    senderUserWorkspaceId,
    parts,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
    agentId: string | null;
    senderUserWorkspaceId: string | null;
    parts: ExtendedUIMessagePart[];
  }): Promise<string> {
    const messageId = randomUUID();

    await this.messageRepository.insert(workspaceId, {
      id: messageId,
      threadId,
      turnId,
      role,
      agentId,
      processedAt: new Date(),
      ...(isDefined(senderUserWorkspaceId) ? { senderUserWorkspaceId } : {}),
    });

    const dbParts = mapUIMessagePartsToDBParts(parts, messageId, workspaceId);

    if (dbParts.length > 0) {
      await this.messagePartRepository.insert(
        workspaceId,
        dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
      );
    }

    return messageId;
  }
}
