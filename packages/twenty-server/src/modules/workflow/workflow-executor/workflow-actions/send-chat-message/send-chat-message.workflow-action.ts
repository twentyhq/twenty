import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { PROPOSE_TOOL_CALL_TOOL_NAME } from 'twenty-shared/ai';
import {
  isDefined,
  isPlainObject,
  isValidUuid,
  resolveInput,
} from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { readToolCallStatus } from 'src/engine/metadata-modules/ai/ai-history/utils/read-tool-call-status.util';
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { buildProposeToolCallPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-tool-call.pausing-tool';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowRunInboxSenderWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.workspace-service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { buildStepExecutionKey } from 'src/modules/workflow/workflow-executor/utils/build-step-execution-key.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { resolveConversationThreadKey } from 'src/modules/workflow/workflow-executor/utils/resolve-conversation-thread-key.util';
import { isWorkflowSendChatMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/guards/is-workflow-send-chat-message-action.guard';
import { findMissingRequiredToolArguments } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/utils/find-missing-required-tool-arguments.util';
import { buildSendChatMessageAnswerResult } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/utils/build-send-chat-message-answer-result.util';
import { type WorkflowSendChatMessageActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/workflow-send-chat-message-action-input.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const MAX_SEND_ATTEMPTS = 10;

@Injectable()
export class SendChatMessageWorkflowAction implements WorkflowAction {
  constructor(
    private readonly agentInboxService: AgentInboxService,
    private readonly workflowRunInboxSenderService: WorkflowRunInboxSenderWorkspaceService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly toolRegistryService: ToolRegistryService,
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
    // a conversation shared by key holds every run's messages, so each run keys its own
    const messageKey =
      conversation?.scope === 'KEY'
        ? `${runInfo.workflowRunId}:${executionKey}`
        : executionKey;
    let awaitingToolCall:
      | ReturnType<SendChatMessageWorkflowAction['resolveAwaitingToolCall']>
      | undefined;
    const buildAwaitingToolCall = isDefined(toolCall)
      ? () => {
          awaitingToolCall ??= this.resolveAwaitingToolCall({
            toolCall,
            summary: text,
            runInfo,
            stepId: currentStepId,
          });

          return awaitingToolCall;
        }
      : undefined;

    const sendMessage = (idempotencyKey: string) =>
      this.agentInboxService.sendMessage({
        workspaceId: runInfo.workspaceId,
        sender,
        input: {
          workspaceMemberId,
          threadKey,
          idempotencyKey,
          title: isNonEmptyString(title) ? title : step.name,
          text,
        },
        buildAwaitingToolCall,
      });
    // a step run again finds the call it posted before: it keeps waiting on a pending one, reuses
    // an answered one so nothing runs twice, and asks again once an earlier call closed unanswered
    for (let attempt = 0; attempt < MAX_SEND_ATTEMPTS; attempt++) {
      const { threadId, isDismissed, awaitedToolOutput } = await sendMessage(
        attempt === 0 ? messageKey : `${messageKey}:${attempt}`,
      );

      if (!isDefined(buildAwaitingToolCall)) {
        return { result: { threadId } };
      }

      if (isDismissed) {
        throw new WorkflowStepExecutorException(
          'The recipient deleted this conversation, so the action cannot be approved',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }

      const status = readToolCallStatus(awaitedToolOutput);

      if (status === 'skipped') {
        continue;
      }

      if (status === 'pending' || status === 'running') {
        // the step waits for the member, and their answer finds it through this thread
        await this.workflowRunWorkspaceService.setStepThreadId({
          stepId: currentStepId,
          threadId,
          workflowRunId: runInfo.workflowRunId,
          workspaceId: runInfo.workspaceId,
        });

        return { wait: { type: 'ANSWER' } };
      }

      return {
        result: buildSendChatMessageAnswerResult({
          threadId,
          toolResult: isPlainObject(awaitedToolOutput) ? awaitedToolOutput : {},
        }),
      };
    }

    throw new WorkflowStepExecutorException(
      `The action was asked ${MAX_SEND_ATTEMPTS} times without an answer`,
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );
  }

  // resolved with the run's permissions, the ones the step itself acts with
  private async resolveAwaitingToolCall({
    toolCall,
    summary,
    runInfo,
    stepId,
  }: {
    toolCall: NonNullable<WorkflowSendChatMessageActionInput['toolCall']>;
    summary: string;
    runInfo: WorkflowActionInput['runInfo'];
    stepId: string;
  }) {
    const { authContext, rolePermissionConfig, application } =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const toolContext = {
      workspaceId: runInfo.workspaceId,
      roleId: getRoleIdsFromRolePermissionConfig(rolePermissionConfig)[0] ?? '',
      rolePermissionConfig,
      authContext,
      application: application ?? undefined,
    } satisfies ToolContext;

    const catalog = await this.toolRegistryService.getCatalog(toolContext);
    const inputSchemas = await this.toolRegistryService.resolveSchemas({
      toolNames: [toolCall.toolName],
      context: toolContext,
      precomputedCatalog: catalog,
    });
    const missingArgumentNames = findMissingRequiredToolArguments({
      inputSchema: inputSchemas.get(toolCall.toolName),
      toolArguments: toolCall.arguments,
    });

    if (missingArgumentNames.length > 0) {
      throw new WorkflowStepExecutorException(
        `The action is missing required arguments: ${missingArgumentNames.join(', ')}`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const input = {
      toolName: toolCall.toolName,
      arguments: toolCall.arguments,
      summary,
    };

    const resolution = await resolveProposedToolCall({
      input,
      findTool: async (toolName) =>
        catalog.find((catalogEntry) => catalogEntry.name === toolName),
      executeTool: ({ toolName, args }) =>
        this.toolRegistryService.resolveAndExecute(toolName, args, toolContext),
    });

    if ('error' in resolution) {
      throw new WorkflowStepExecutorException(
        `The tool call cannot be proposed: ${resolution.error}`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    return {
      toolName: PROPOSE_TOOL_CALL_TOOL_NAME,
      input,
      output: {
        ...buildProposeToolCallPendingOutput(resolution.proposal),
        workflowStep: { workflowRunId: runInfo.workflowRunId, stepId },
      },
    };
  }
}
