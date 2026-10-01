import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUuid, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { buildStepExecutionKey } from 'src/modules/workflow/workflow-executor/utils/build-step-execution-key.util';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowSendChatMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/guards/is-workflow-send-chat-message-action.guard';
import { type WorkflowSendChatMessageActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/workflow-send-chat-message-action-input.type';

@Injectable()
export class SendChatMessageWorkflowAction implements WorkflowAction {
  constructor(
    private readonly agentInboxService: AgentInboxService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
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

    const { workspaceMemberId, title, text } = resolveInput(
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

    const workflow = await this.findRunWorkflowOrThrow(runInfo);

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
    });

    return { result: { threadId } };
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
