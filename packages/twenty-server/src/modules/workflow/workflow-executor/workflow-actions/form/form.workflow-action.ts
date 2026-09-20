import { Injectable } from '@nestjs/common';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowFormAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/guards/is-workflow-form-action.guard';

@Injectable()
export class FormWorkflowAction implements WorkflowAction {
  constructor(
    private readonly inputAskWorkspaceService: InputAskWorkspaceService,
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

    // Written before the step reports itself pending: a run that pauses without
    // its Ask is a question nobody can find, whereas an Ask whose run never
    // parks is answerable and resolves the step when it does.
    await this.inputAskWorkspaceService.openForWorkflowRunStep({
      workspaceId: runInfo.workspaceId,
      workflowRunId: runInfo.workflowRunId,
      stepId: step.id,
      stepName: step.name,
      fields: step.settings.input,
    });

    return {
      pendingEvent: true,
    };
  }
}
