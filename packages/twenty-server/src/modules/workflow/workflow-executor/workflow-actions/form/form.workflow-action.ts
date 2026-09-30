import { Injectable } from '@nestjs/common';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { isWorkflowFormAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/guards/is-workflow-form-action.guard';

@Injectable()
export class FormWorkflowAction implements WorkflowAction {
  constructor(
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowFormAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a form action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    // A workspace 2.44 has not reached yet cannot record the conversation, and
    // its upgrade records one for every form still waiting.
    await this.workflowAgentConversationService.recordFormRequest({
      workspaceId: runInfo.workspaceId,
      workflowRunId: runInfo.workflowRunId,
      stepId: currentStepId,
      title: step.name,
      fields: step.settings.input,
    });

    return { pendingEvent: true };
  }
}
