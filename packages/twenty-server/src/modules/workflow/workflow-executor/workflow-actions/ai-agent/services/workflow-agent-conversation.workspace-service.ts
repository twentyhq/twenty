import { Injectable } from '@nestjs/common';

import { convertToModelMessages, type ModelMessage } from 'ai';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  REQUEST_FORM_TOOL_NAME,
  type RequestFormToolInput,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapAiStepsToUiMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-ui-message-parts.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapDBPartsToUIMessageParts';
import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';
import { buildRequestFormPendingOutput } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export type RecordedExecutionResult = {
  steps?: Pick<NonNullable<AgentExecutionResult['steps']>[number], 'content'>[];
  isPaused?: boolean;
};

export type RecordedConversation = {
  threadId: string;
  isAwaitingAnswer: boolean;
};

// One conversation per execution, so a loop iteration or retry never reads or continues another's messages.
// It belongs to the run, and is owned by the workflow's creator so a call waiting on input reaches their inbox.
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly threadService: AgentChatThreadService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunRecordShareService: WorkflowRunRecordShareService,
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
      title,
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

    await this.threadService.recordThreadActivity({
      workspaceId,
      threadId,
      text: title,
    });
  }

  // The answer is already the last message, so only the agent's reply is added
  async recordContinuation({
    workspaceId,
    threadId,
    title,
    agentId,
    executionResult,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
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
      title,
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
    title,
    agentId,
    executionResult,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    title: string;
    agentId: string | null;
    executionResult: RecordedExecutionResult;
  }): Promise<boolean> {
    const replyParts = mapAiStepsToUiMessageParts(executionResult.steps ?? []);

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

    if (isAwaitingAnswer) {
      await this.threadService.recordThreadActivity({
        workspaceId,
        threadId,
        text: findLastMessageText(replyParts) ?? title,
      });
    }

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
    const threadId = await this.createRunThread({
      workspaceId,
      workflowRunId,
      title,
    });

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

  // a workflow without a member creator, such as one an application installs, or whose creator
  // cannot use AI, keeps an ownerless conversation
  private async createRunThread({
    workspaceId,
    workflowRunId,
    title,
  }: {
    workspaceId: string;
    workflowRunId: string;
    title: string;
  }): Promise<string> {
    const { coreWorkflowId } =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });
    const creatorWorkspaceMemberId = isDefined(coreWorkflowId)
      ? await this.workflowRunRecordShareService.findCreatorWorkspaceMemberId({
          workspaceId,
          coreWorkflowId,
        })
      : null;

    const ownedThread = isDefined(creatorWorkspaceMemberId)
      ? await this.threadService
          .createThread({
            workspaceId,
            workspaceMemberId: creatorWorkspaceMemberId,
            title,
            workflowRunId,
          })
          .catch((error: unknown) => {
            if (
              error instanceof AiException &&
              error.code === AiExceptionCode.THREAD_NOT_FOUND
            ) {
              return null;
            }
            throw error;
          })
      : null;

    if (isDefined(ownedThread)) {
      return ownedThread.id;
    }

    const threadInsertResult = await this.threadRepository.insert(workspaceId, {
      title,
      workflowRunId,
    });

    return threadInsertResult.identifiers[0].id as string;
  }
}
