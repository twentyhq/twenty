import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { convertToModelMessages, type ModelMessage } from 'ai';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  REQUEST_FORM_TOOL_NAME,
  type RequestFormToolInput,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
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
import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';
import { buildRequestFormPendingOutput } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { hasWorkflowRunThreadFields } from 'src/engine/metadata-modules/ai/ai-history/utils/has-workflow-run-thread-fields.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

export type RecordedExecutionResult = {
  steps?: Pick<NonNullable<AgentExecutionResult['steps']>[number], 'content'>[];
  isPaused?: boolean;
};

export type RecordedConversation = {
  threadId: string;
  isAwaitingAnswer: boolean;
};

// A conversation is recorded only for an execution of a step that waits on a
// person, a form or an agent that asks, and continued when that execution
// resumes. Each gets its own, so a loop iteration or a retry never reads or
// continues another one's messages. The conversation has no owner: it belongs
// to the run and is readable by whoever can read the run.
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
    executionResult: RecordedExecutionResult;
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

    const isAwaitingAnswer = await this.recordReply({
      workspaceId,
      threadId,
      turnId,
      agentId,
      executionResult,
    });

    return { threadId, isAwaitingAnswer };
  }

  // A form step asks for its fields the way an agent would, so it is answered
  // like any call that waits on a person. The call is named after the step.
  async recordFormRequest({
    workspaceId,
    workflowRunId,
    stepId,
    title,
    fields,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    title: string;
    fields: RequestFormToolInput['fields'];
  }): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    if (!hasWorkflowRunThreadFields(flatFieldMetadataMaps)) {
      return;
    }

    const threadInsertResult = await this.threadRepository.insert(workspaceId, {
      title,
      workflowRunId,
    });
    const threadId = threadInsertResult.identifiers[0].id as string;

    const turnId = await this.insertTurn({
      workspaceId,
      threadId,
      agentId: null,
    });

    const messageId = await this.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      parts: [
        {
          type: `tool-${REQUEST_FORM_TOOL_NAME}`,
          toolCallId: stepId,
          state: 'output-available',
          input: { fields },
          output: buildRequestFormPendingOutput(),
        } as ExtendedUIMessagePart,
      ],
    });

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { pendingQuestionMessageId: messageId },
    );

    await this.workflowRunWorkspaceService.setStepThreadId({
      stepId,
      threadId,
      workflowRunId,
      workspaceId,
    });
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
    executionResult: RecordedExecutionResult;
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

  // A paused reply marks its conversation as waiting on its calls, all of
  // which have to be answerable: one call nobody can answer would keep the
  // step waiting forever on the others, so the step fails instead.
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
    executionResult: RecordedExecutionResult;
  }): Promise<boolean> {
    const replyParts = mapAiStepsToUiMessageParts(executionResult.steps ?? []);

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

    const awaitingParts = findAwaitingPausingToolParts(replyParts);

    if (
      executionResult.isPaused !== true ||
      awaitingParts.length === 0 ||
      !awaitingParts.every(({ isAnswerable }) => isAnswerable)
    ) {
      return false;
    }

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { pendingQuestionMessageId: messageId },
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
