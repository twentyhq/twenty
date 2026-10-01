import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowSendChatMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/guards/is-workflow-send-chat-message-action.guard';
import { type WorkflowSendChatMessageActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/workflow-send-chat-message-action-input.type';
import { buildSendChatMessageIdempotencyKey } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/utils/build-send-chat-message-idempotency-key.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class SendChatMessageWorkflowAction implements WorkflowAction {
  constructor(
    private readonly agentInboxService: AgentInboxService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly featureFlagService: FeatureFlagService,
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

    const isSendChatMessageEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED,
        runInfo.workspaceId,
      );

    if (!isSendChatMessageEnabled) {
      throw new WorkflowStepExecutorException(
        'Sending chat messages from workflows is not enabled',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { workspaceMemberId, title, message } = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowSendChatMessageActionInput;

    if (!isValidUuid(workspaceMemberId)) {
      throw new WorkflowStepExecutorException(
        'Recipient must be a workspace member',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    if (!isNonEmptyString(message)) {
      throw new WorkflowStepExecutorException(
        'Message is required',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
      });

    // Each run gets its own conversation with the member, so every message
    // a run sends reads as one exchange.
    const { threadId } = await this.agentInboxService.sendMessage({
      workspaceId: runInfo.workspaceId,
      sender: {
        type: 'workflow',
        workflowId: workflowRun.workflowId ?? runInfo.workflowRunId,
        workflowName: await this.findWorkflowName({
          workspaceId: runInfo.workspaceId,
          workflowId: workflowRun.workflowId,
        }),
      },
      input: {
        workspaceMemberId,
        threadKey: runInfo.workflowRunId,
        idempotencyKey: buildSendChatMessageIdempotencyKey({
          stepId: currentStepId,
          title,
          message,
        }),
        title: isNonEmptyString(title) ? title : step.name,
        text: message,
      },
    });

    return { result: { threadId } };
  }

  private async findWorkflowName({
    workspaceId,
    workflowId,
  }: {
    workspaceId: string;
    workflowId: string | null;
  }): Promise<string> {
    if (!isDefined(workflowId)) {
      return 'Workflow';
    }

    const workflow = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository<WorkflowWorkspaceEntity>('workflow', {
            shouldBypassPermissionChecks: true,
          })
          .findOne({ where: { id: workflowId }, select: ['id', 'name'] }),
      buildSystemAuthContext(workspaceId),
    );

    return isNonEmptyString(workflow?.name) ? workflow.name : 'Workflow';
  }
}
