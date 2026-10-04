import { Injectable, Logger } from '@nestjs/common';

import {
  type ExtendedUIMessagePart,
  REQUEST_FORM_TOOL_NAME,
  type RequestFormToolInput,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { buildRequestFormPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/request-form.pausing-tool';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type RecordableAgentExecution } from 'src/engine/metadata-modules/ai/ai-history/types/recordable-agent-execution.type';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/is-awaiting-pausing-tool-output.util';
import { WORKFLOW_AGENT_WAIT_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-wait-tool-names.constant';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export type RecordedConversation = {
  threadId: string;
  isAwaitingAnswer: boolean;
};

// One conversation per execution, so a loop iteration or retry never reads or continues another's messages.
// It belongs to the run, and is owned by the workflow's creator so a call waiting on input reaches their inbox.
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  private readonly logger = new Logger(
    WorkflowAgentConversationWorkspaceService.name,
  );

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
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
    executionResult: RecordableAgentExecution;
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

    await this.recordWaitingActivity({ workspaceId, threadId, text: title });
  }

  // The wait call stays pending in the conversation until its wait resolves, then carries the outcome
  async recordWaitOutcome({
    workspaceId,
    threadId,
    toolOutput,
  }: {
    workspaceId: string;
    threadId: string;
    toolOutput: Record<string, unknown>;
  }): Promise<void> {
    const [lastMessage] = await this.messageRepository.find(workspaceId, {
      where: { threadId },
      order: { createdAt: 'DESC' },
      take: 1,
      relations: ['parts'],
    });

    const waitPart = lastMessage?.parts?.find(
      (part) =>
        isDefined(part.toolName) &&
        WORKFLOW_AGENT_WAIT_TOOL_NAMES.includes(part.toolName) &&
        isAwaitingPausingToolOutput(part.toolOutput),
    );

    if (!isDefined(waitPart)) {
      throw new AiException(
        'The waiting call could not be found in the conversation',
        AiExceptionCode.TOOL_CALL_NOT_FOUND,
      );
    }

    await this.messagePartRepository.update(
      workspaceId,
      { id: waitPart.id },
      { toolOutput },
    );
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
    executionResult: RecordableAgentExecution;
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
    executionResult: RecordableAgentExecution;
  }): Promise<boolean> {
    const { isAwaitingAnswer, replyParts } =
      await this.conversationWriterService.insertExecutionReply({
        workspaceId,
        threadId,
        turnId,
        agentId,
        execution: executionResult,
      });

    if (isAwaitingAnswer) {
      await this.recordWaitingActivity({
        workspaceId,
        threadId,
        text: findLastMessageText(replyParts) ?? title,
      });
    }

    return isAwaitingAnswer;
  }

  // the waiting call is already saved and can be answered from the run, so a failure to
  // surface it in the inbox must not fail the step
  private async recordWaitingActivity(args: {
    workspaceId: string;
    threadId: string;
    text: string;
  }): Promise<void> {
    await this.threadService
      .recordThreadActivity(args)
      .catch((error: unknown) =>
        this.logger.warn(
          `Could not record waiting activity on thread ${args.threadId}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
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
