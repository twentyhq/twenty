import { Injectable } from '@nestjs/common';

import { convertToModelMessages, type ModelMessage } from 'ai';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  REQUEST_FORM_TOOL_NAME,
  type RequestFormToolInput,
} from 'twenty-shared/ai';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapAiStepsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-ui-message-parts.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-db-parts-to-ui-message-parts.util';
import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';
import { buildRequestFormPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/request-form.pausing-tool';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

export type RecordedExecutionResult = {
  steps: Pick<AgentExecutionResult['steps'][number], 'content'>[];
  isPaused?: boolean;
};

export type RecordedConversation = {
  threadId: string;
  isAwaitingAnswer: boolean;
};

// One conversation per execution, so a loop iteration or retry never reads or continues another's messages.
// It has no owner: it belongs to the run and is readable by whoever can read the run.
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
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
  }): Promise<RecordedConversation> {
    const { threadId, turnId } = await this.openConversation({
      workspaceId,
      workflowRunId,
      stepId,
      title,
      agentId,
    });

    await this.conversationWriterService.insertMessage({
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

    return { threadId, isAwaitingAnswer };
  }

  // A form step is answered like any call that waits on a person
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
    const { threadId, turnId } = await this.openConversation({
      workspaceId,
      workflowRunId,
      stepId,
      title,
      agentId: null,
    });

    await this.conversationWriterService.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      isAwaitingAnswer: true,
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
  }

  // The answer is already the last message, so only the agent's reply is added
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
    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
      agentId,
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

  // One unanswerable call would keep the step waiting forever, so the step fails instead
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
    const replyParts = mapAiStepsToUIMessageParts(executionResult.steps);

    if (replyParts.length === 0) {
      return false;
    }

    const awaitingParts = findAwaitingPausingToolParts(replyParts);
    const isAwaitingAnswer =
      executionResult.isPaused === true &&
      awaitingParts.length > 0 &&
      awaitingParts.every(({ isAnswerable }) => isAnswerable);

    await this.conversationWriterService.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId,
      senderUserWorkspaceId: null,
      isAwaitingAnswer,
      parts: replyParts,
    });

    return isAwaitingAnswer;
  }

  private async openConversation({
    workspaceId,
    workflowRunId,
    stepId,
    title,
    agentId,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    title: string;
    agentId: string | null;
  }): Promise<{ threadId: string; turnId: string }> {
    const threadInsertResult = await this.threadRepository.insert(workspaceId, {
      title,
      workflowRunId,
    });
    const threadId = threadInsertResult.identifiers[0].id as string;

    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
      agentId,
    });

    await this.workflowRunWorkspaceService.setStepThreadId({
      stepId,
      threadId,
      workflowRunId,
      workspaceId,
    });

    return { threadId, turnId };
  }
}
