import { Injectable } from '@nestjs/common';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import {
  WorkflowExecutorException,
  WorkflowExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-executor.exception';
import { isWorkflowAction } from 'src/modules/workflow/workflow-executor/guards/is-workflow-action.guard';
import { isWorkflowStep } from 'src/modules/workflow/workflow-executor/guards/is-workflow-step.guard';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowStepResult } from 'src/modules/workflow/workflow-executor/types/workflow-step-result.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/workflow-actions/factories/workflow-action.factory';

@Injectable()
export class WorkflowActionExecutorWorkspaceService
  implements WorkflowExecutor
{
  constructor(private readonly workflowActionFactory: WorkflowActionFactory) {}

  async executeDeprecated(
    input: WorkflowExecutorInput,
  ): Promise<WorkflowStepResult> {
    const actionStep = input.steps[input.currentStepIndex];

    if (!isWorkflowAction(actionStep)) {
      throw new WorkflowExecutorException(
        'Action step is not a valid step',
        WorkflowExecutorExceptionCode.INVALID_STEP,
      );
    }

    const action = this.workflowActionFactory.get(actionStep.type);
    const actionPayload = resolveInput(
      actionStep.settings.input,
      input.context,
    );

    return action.execute(actionPayload);
  }

  async execute(input: WorkflowExecutorInput): Promise<WorkflowStepResult> {
    const actionStep = input.steps[input.currentStepIndex];

    if (!isWorkflowStep(actionStep)) {
      throw new WorkflowExecutorException(
        'Action step is not a valid step',
        WorkflowExecutorExceptionCode.INVALID_STEP,
      );
    }

    const action = this.workflowActionFactory.get(actionStep.stepSettings.type);
    const actionPayload = resolveInput(
      actionStep.stepSettings.actionSettings.input,
      input.context,
    );

    return action.execute(actionPayload);
  }
}
