import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { convertToModelMessages, type ModelMessage } from 'ai';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapAiStepsToUiMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-ui-message-parts.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartsToUIMessageParts';
import { mapUIMessagePartsToPersistedDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-persisted-db-parts.util';
import { findAwaitingPausingToolPart } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-part.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { hasWorkflowRunThreadFields } from 'src/engine/metadata-modules/ai/ai-history/utils/has-workflow-run-thread-fields.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowPendingAsk } from 'src/modules/workflow/workflow-executor/types/workflow-pending-ask.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

export type RecordedExecutionResult = {
  steps?: Pick<NonNullable<AgentExecutionResult['steps']>[number], 'content'>[];
  isPaused?: boolean;
};

export type RecordedConversation = {
  threadId: string;
  pendingAsk: WorkflowPendingAsk | null;
};

// A conversation is recorded only for an execution of an agent step that asks
// a question, and continued when that execution resumes. Each gets its own, so
// a loop iteration or a retry never reads or continues another one's messages.
// The conversation has no owner: it belongs to the run and is readable by
// whoever can read the run.
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
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
    executionResult?: RecordedExecutionResult;
  }): Promise<RecordedConversation | null> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    if (!hasWorkflowRunThreadFields(flatFieldMetadataMaps)) {
      return null;
    }

    const threadInsertResult = await this.threadRepository.insert(workspaceId, {
      title,
      workflowRunId,
    });
    const threadId = threadInsertResult.identifiers[0].id as string;

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

    await this.workflowRunWorkspaceService.setStepThreadId({
      stepId,
      threadId,
      workflowRunId,
      workspaceId,
    });

    const pendingAsk = await this.recordReply({
      workspaceId,
      threadId,
      turnId,
      agentId,
      executionResult,
    });

    return { threadId, pendingAsk };
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

    const pendingAsk = await this.recordReply({
      workspaceId,
      threadId,
      turnId,
      agentId,
      executionResult,
    });

    return { threadId, pendingAsk };
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
        processedAt: { order: 'ASC', nulls: 'NULLS LAST' },
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

  // Records a person's answer where the agent will read it on resuming: the
  // call's result, then the answer as the person's message in the call's turn.
  async recordAnswer({
    workspaceId,
    threadId,
    toolCallId,
    toolResult,
    answerText,
    senderUserWorkspaceId,
  }: {
    workspaceId: string;
    threadId: string;
    toolCallId: string;
    toolResult: Record<string, unknown>;
    answerText: string;
    senderUserWorkspaceId: string;
  }): Promise<void> {
    const toolParts = await this.messagePartRepository.find(workspaceId, {
      where: { toolCallId },
      select: ['id', 'messageId'],
    });
    const toolCallMessage = isNonEmptyArray(toolParts)
      ? await this.messageRepository.findOne(workspaceId, {
          where: {
            id: In(toolParts.map((toolPart) => toolPart.messageId)),
            threadId,
          },
          select: ['id', 'turnId'],
        })
      : null;
    const toolPart = toolParts.find(
      (candidate) => candidate.messageId === toolCallMessage?.id,
    );

    if (!isDefined(toolPart) || !isDefined(toolCallMessage?.turnId)) {
      throw new WorkflowStepExecutorException(
        `Tool call ${toolCallId} not found in conversation ${threadId}`,
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    await this.messagePartRepository.update(
      workspaceId,
      { id: toolPart.id },
      { toolOutput: toolResult },
    );

    await this.insertMessage({
      workspaceId,
      threadId,
      turnId: toolCallMessage.turnId,
      role: AgentMessageRole.USER,
      agentId: null,
      senderUserWorkspaceId,
      parts: [{ type: 'text', text: answerText }],
    });
  }

  // The run opens the Ask when it parks the step, under the lock that
  // transition takes; the conversation only says what it would be.
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
  }): Promise<WorkflowPendingAsk | null> {
    const replyParts = mapAiStepsToUiMessageParts(executionResult?.steps ?? []);

    if (replyParts.length === 0) {
      return null;
    }

    await this.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId,
      senderUserWorkspaceId: null,
      parts: replyParts,
    });

    const awaitingPart = executionResult?.isPaused
      ? findAwaitingPausingToolPart(replyParts)
      : undefined;
    const pausingToolCall = awaitingPart?.pausingTool.parseCall(
      awaitingPart.input,
    );

    if (!isDefined(awaitingPart) || !isDefined(pausingToolCall)) {
      return null;
    }

    return {
      ...pausingToolCall.buildAsk(),
      threadId,
      toolCallId: awaitingPart.toolCallId,
    };
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
      processedAt: new Date().toISOString(),
      ...(isDefined(senderUserWorkspaceId) ? { senderUserWorkspaceId } : {}),
    });

    const dbParts = mapUIMessagePartsToPersistedDBParts(
      parts,
      messageId,
      workspaceId,
    );

    if (dbParts.length > 0) {
      await this.messagePartRepository.insert(
        workspaceId,
        dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
      );
    }

    return messageId;
  }
}
