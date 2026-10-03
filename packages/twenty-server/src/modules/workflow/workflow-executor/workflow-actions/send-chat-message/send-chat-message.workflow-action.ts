import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { PROPOSE_TOOL_CALL_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { buildProposeToolCallPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-tool-call.pausing-tool';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { buildStepExecutionKey } from 'src/modules/workflow/workflow-executor/utils/build-step-execution-key.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowSendChatMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/guards/is-workflow-send-chat-message-action.guard';
import { type WorkflowSendChatMessageActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/workflow-send-chat-message-action-input.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class SendChatMessageWorkflowAction implements WorkflowAction {
  constructor(
    private readonly agentInboxService: AgentInboxService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
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

    const { workspaceMemberId, title, text, toolCall } = resolveInput(
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

    const [workflow, awaitingToolCall] = await Promise.all([
      this.findRunWorkflowOrThrow(runInfo),
      isDefined(toolCall)
        ? this.buildAwaitingToolCall({
            toolCall,
            summary: text,
            runInfo,
            stepId: currentStepId,
          })
        : undefined,
    ]);

    // Each run gets its own conversation with the member, so every message
    // a run sends reads as one exchange.
    const { threadId } = await this.agentInboxService.sendMessage({
      workspaceId: runInfo.workspaceId,
      sender: {
        type: 'workflow',
        workflowId: workflow.id,
        workflowName: isNonEmptyString(workflow.name)
          ? workflow.name
          : 'Untitled',
      },
      input: {
        workspaceMemberId,
        threadKey: runInfo.workflowRunId,
        idempotencyKey: buildStepExecutionKey({
          stepId: currentStepId,
          steps,
          context,
        }),
        title: isNonEmptyString(title) ? title : step.name,
        text,
      },
      awaitingToolCall,
    });

    if (!isDefined(awaitingToolCall)) {
      return { result: { threadId } };
    }

    // the step waits for the member, and their answer finds it through this thread
    await this.workflowRunWorkspaceService.setStepThreadId({
      stepId: currentStepId,
      threadId,
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    return { pendingEvent: true };
  }

  // resolved with the run's permissions, the ones the step itself acts with
  private async buildAwaitingToolCall({
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

    const toolContext: ToolContext = {
      workspaceId: runInfo.workspaceId,
      roleId: getRoleIdsFromRolePermissionConfig(rolePermissionConfig)[0] ?? '',
      rolePermissionConfig,
      authContext,
      application: application ?? undefined,
    };

    const input = {
      toolName: toolCall.toolName,
      arguments: toolCall.arguments,
      summary,
    };

    const resolution = await resolveProposedToolCall({
      input,
      findTool: (toolName) =>
        this.toolRegistryService.findCatalogEntry(toolName, toolContext),
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

  // Every run carries the core workflow it was started from, which is the
  // identity the executor bills and the conversation is attributed to.
  private async findRunWorkflowOrThrow({
    workflowRunId,
    workspaceId,
  }: WorkflowActionInput['runInfo']): Promise<
    Pick<WorkflowEntity, 'id' | 'name'>
  > {
    const workflowRun =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<WorkflowRunWorkspaceEntity>('workflowRun', {
              shouldBypassPermissionChecks: true,
            })
            .findOne({
              where: { id: workflowRunId },
              select: ['id', 'coreWorkflowId'],
            }),
        buildSystemAuthContext(workspaceId),
      );

    const workflow = isDefined(workflowRun?.coreWorkflowId)
      ? await this.workflowCoreSyncService.findCoreWorkflowById(
          workspaceId,
          workflowRun.coreWorkflowId,
        )
      : null;

    if (!isDefined(workflow)) {
      throw new WorkflowStepExecutorException(
        'Workflow run has no workflow',
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    return workflow;
  }
}
