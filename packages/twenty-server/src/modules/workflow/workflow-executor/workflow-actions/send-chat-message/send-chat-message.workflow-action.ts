import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowRunInboxSenderWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.workspace-service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { buildStepExecutionKey } from 'src/modules/workflow/workflow-executor/utils/build-step-execution-key.util';
import { buildWorkflowStepCaller } from 'src/modules/workflow/workflow-executor/utils/build-workflow-step-caller.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { resolveConversationThreadKey } from 'src/modules/workflow/workflow-executor/utils/resolve-conversation-thread-key.util';
import { isWorkflowSendChatMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/guards/is-workflow-send-chat-message-action.guard';
import { type WorkflowSendChatMessageActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/workflow-send-chat-message-action-input.type';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

@Injectable()
export class SendChatMessageWorkflowAction implements WorkflowAction {
  constructor(
    private readonly agentCallerConversationService: AgentCallerConversationService,
    private readonly workflowRunInboxSenderService: WorkflowRunInboxSenderWorkspaceService,
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (!isWorkflowSendChatMessageAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a send chat message action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { workspaceMemberId, title, text, toolCall, conversation } =
      resolveInput(
        step.settings.input,
        context,
      ) as WorkflowSendChatMessageActionInput;

    if (!isValidUuid(workspaceMemberId)) {
      throw new WorkflowStepExecutorException(
        'Recipient must be a workspace member',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    if (!isNonEmptyString(text)) {
      throw new WorkflowStepExecutorException(
        'Text is required',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const sender =
      await this.workflowRunInboxSenderService.findRunSenderOrThrow(runInfo);
    const executionKey = buildStepExecutionKey({
      stepId: currentStepId,
      steps,
      context,
    });
    const threadKey = resolveConversationThreadKey({
      conversation,
      defaultScope: 'RUN',
      workflowRunId: runInfo.workflowRunId,
      stepExecutionKey: executionKey,
    });

    const delivery = await this.agentCallerConversationService.sendMessage({
      workspaceId: runInfo.workspaceId,
      sender,
      message: {
        workspaceMemberIds: [workspaceMemberId],
        threadKey,
        // a conversation shared by key holds every run's messages, so each run keys its own
        idempotencyKey:
          conversation?.scope === 'KEY'
            ? `${runInfo.workflowRunId}:${executionKey}`
            : executionKey,
        title: isNonEmptyString(title) ? title : step.name,
        text,
      },
      fallbackThreadKey: `${threadKey}:${runInfo.workflowRunId}:${currentStepId}`,
      awaitedToolCall: isDefined(toolCall)
        ? {
            ...toolCall,
            caller: buildWorkflowStepCaller({
              workflowRunId: runInfo.workflowRunId,
              stepId: currentStepId,
            }),
            waitOnAnswer: (postedCall) =>
              this.workflowStepWaitWorkspaceService.arm({
                workspaceId: runInfo.workspaceId,
                workflowRunId: runInfo.workflowRunId,
                stepId: currentStepId,
                wait: { type: 'ANSWER', ...postedCall },
              }),
          }
        : undefined,
    });

    switch (delivery.status) {
      case 'DELIVERED':
        return { result: { threadId: delivery.threadId } };
      case 'DISMISSED':
        throw new WorkflowStepExecutorException(
          'The recipient deleted this conversation, so the action cannot be approved',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      // the step waits for the member, and their answer resolves the wait
      case 'AWAITING':
        return {
          wait: {
            type: 'ANSWER',
            threadId: delivery.threadId,
            toolCallId: delivery.toolCallId,
          },
        };
      case 'ANSWERED':
        return { result: { threadId: delivery.threadId, ...delivery.answer } };
    }
  }
}
