import { Injectable, Logger } from '@nestjs/common';

import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/is-awaiting-pausing-tool-output.util';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { type ToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-chat/types/tool-call-workflow-step.type';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import { readToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-chat/utils/read-tool-call-workflow-step.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type RecordableAgentExecution } from 'src/engine/metadata-modules/ai/ai-history/types/recordable-agent-execution.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkflowRunInboxSenderWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.workspace-service';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { WORKFLOW_AGENT_WAIT_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-wait-tool-names.constant';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const RECENT_MESSAGES_TO_SEARCH_FOR_WAIT = 50;

export type OpenedConversation = {
  threadId: string;
  // what the conversation held before this execution, which the agent continues from
  priorMessages: ExtendedUIMessage[];
};

export type RecordedConversation = {
  threadId: string;
  isAwaitingAnswer: boolean;
};

// Every execution records its conversation through the inbox, with the step's
// recipient or else the workflow's creator. A conversation the execution opens is
// filed under done, and only comes back to the inbox when the agent needs them.
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  private readonly logger = new Logger(
    WorkflowAgentConversationWorkspaceService.name,
  );

  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly agentInboxService: AgentInboxService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly threadService: AgentChatThreadService,
    private readonly workflowRunInboxSenderService: WorkflowRunInboxSenderWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunRecordShareService: WorkflowRunRecordShareService,
  ) {}

  async openConversation({
    runInfo,
    stepId,
    title,
    recipientWorkspaceMemberId,
    threadKey,
  }: {
    runInfo: WorkflowRunInfo;
    stepId: string;
    title: string;
    recipientWorkspaceMemberId: string | null;
    threadKey: string;
  }): Promise<OpenedConversation> {
    const { workspaceId, workflowRunId } = runInfo;
    const sender =
      await this.workflowRunInboxSenderService.findRunSenderOrThrow(runInfo);
    const openThread = (workspaceMemberId: string | null) =>
      this.agentInboxService.openThread({
        workspaceId,
        sender,
        workspaceMemberId,
        threadKey,
        title,
        isArchivedOnCreate: true,
      });

    const { thread, isCreated } = isDefined(recipientWorkspaceMemberId)
      ? await openThread(recipientWorkspaceMemberId)
      : await this.openThreadWithCreator({
          workspaceId,
          coreWorkflowId: sender.workflowId,
          openThread,
        });

    await this.workflowRunWorkspaceService.setStepThreadId({
      stepId,
      threadId: thread.id,
      workflowRunId,
      workspaceId,
    });

    return {
      threadId: thread.id,
      priorMessages: isCreated
        ? []
        : await this.conversationReaderService.loadMessages({
            workspaceId,
            threadId: thread.id,
          }),
    };
  }

  async recordExecution({
    workspaceId,
    threadId,
    workflowStep,
    title,
    agentId,
    prompt,
    initiatorUserWorkspaceId,
    executionResult,
  }: {
    workspaceId: string;
    threadId: string;
    workflowStep: ToolCallWorkflowStep;
    title: string;
    agentId: string | null;
    prompt: string;
    initiatorUserWorkspaceId: string | null;
    executionResult: RecordableAgentExecution;
  }): Promise<RecordedConversation> {
    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
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
      workflowStep,
      title,
      agentId,
      executionResult,
    });

    return { threadId, isAwaitingAnswer };
  }

  // The answer is already the last message, so only the agent's reply is added
  async recordContinuation({
    workspaceId,
    threadId,
    workflowStep,
    title,
    agentId,
    executionResult,
  }: {
    workspaceId: string;
    threadId: string;
    workflowStep: ToolCallWorkflowStep;
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
      workflowStep,
      title,
      agentId,
      executionResult,
    });

    return { threadId, isAwaitingAnswer };
  }

  // The wait call stays pending in the conversation until its wait resolves, then carries the outcome
  async recordWaitOutcome({
    workspaceId,
    threadId,
    workflowStep,
    toolOutput,
  }: {
    workspaceId: string;
    threadId: string;
    workflowStep: ToolCallWorkflowStep;
    toolOutput: Record<string, unknown>;
  }): Promise<void> {
    // messages can follow the call while it waits, so the latest one may not carry it
    const recentMessages = await this.messageRepository.find(workspaceId, {
      where: { threadId },
      order: { createdAt: 'DESC' },
      take: RECENT_MESSAGES_TO_SEARCH_FOR_WAIT,
      relations: ['parts'],
    });

    const waitPart = recentMessages
      .flatMap((message) => message.parts ?? [])
      .find((part) => {
        const partWorkflowStep = readToolCallWorkflowStep(part.toolOutput);

        return (
          isDefined(part.toolName) &&
          WORKFLOW_AGENT_WAIT_TOOL_NAMES.includes(part.toolName) &&
          isAwaitingPausingToolOutput(part.toolOutput) &&
          partWorkflowStep?.workflowRunId === workflowStep.workflowRunId &&
          partWorkflowStep.stepId === workflowStep.stepId
        );
      });

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

  // a workflow without a member creator, such as one an application installs, or whose
  // creator cannot use AI, keeps a conversation no inbox receives
  private async openThreadWithCreator({
    workspaceId,
    coreWorkflowId,
    openThread,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    openThread: (
      workspaceMemberId: string | null,
    ) => ReturnType<AgentInboxService['openThread']>;
  }): ReturnType<AgentInboxService['openThread']> {
    const creatorWorkspaceMemberId =
      await this.workflowRunRecordShareService.findCreatorWorkspaceMemberId({
        workspaceId,
        coreWorkflowId,
      });

    if (!isDefined(creatorWorkspaceMemberId)) {
      return openThread(null);
    }

    try {
      return await openThread(creatorWorkspaceMemberId);
    } catch (error) {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.THREAD_NOT_FOUND
      ) {
        return openThread(null);
      }

      throw error;
    }
  }

  private async recordReply({
    workspaceId,
    threadId,
    turnId,
    workflowStep,
    title,
    agentId,
    executionResult,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    workflowStep: ToolCallWorkflowStep;
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
        workflowStep,
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

  // the waiting call is already saved and can be answered from the conversation, so a
  // failure to bring it back to the inbox must not fail the step
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
}
