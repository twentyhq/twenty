import { Injectable } from '@nestjs/common';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';
import { isWorkflowFilterAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/guards/is-workflow-filter-action.guard';
import { applyFilter } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/apply-filter.util';

import { getPreviousStepOutput } from './utils/get-previous-step-output.util';

@Injectable()
export class FilterWorkflowAction implements WorkflowExecutor {
  async execute(input: WorkflowExecutorInput): Promise<WorkflowExecutorOutput> {
    const { currentStepId, steps, context } = input;

    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }

    if (!isWorkflowFilterAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a filter action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { filter } = step.settings.input;

    if (!filter) {
      throw new WorkflowStepExecutorException(
        'Filter is not defined',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_SETTINGS,
      );
    }

    const previousStepOutput = getPreviousStepOutput(
      steps,
      currentStepId,
      context,
    );

    const isPreviousStepOutputArray = Array.isArray(previousStepOutput);

    const previousStepOutputArray = isPreviousStepOutputArray
      ? previousStepOutput
      : [previousStepOutput];

    const filteredOutput = applyFilter(previousStepOutputArray, filter);

    if (filteredOutput.length === 0) {
      return {
        result: undefined,
      };
    }

    return {
      result: isPreviousStepOutputArray ? filteredOutput : filteredOutput[0],
    };
  }
}
