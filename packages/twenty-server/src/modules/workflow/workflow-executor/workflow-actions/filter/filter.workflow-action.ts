import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowFilterAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/guards/is-workflow-filter-action.guard';
import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

@Injectable()
export class FilterWorkflowAction implements WorkflowAction {
  async execute(input: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const { currentStepId, steps, context } = input;

    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowFilterAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a filter action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { stepFilterGroups, stepFilters } = step.settings.input;

    if (!stepFilterGroups || !stepFilters) {
      return {
        result: {
          shouldEndWorkflowRun: false,
        },
      };
    }

    const resolvedFilters = stepFilters.map((filter) => ({
      ...filter,
      rightOperand: resolveInput(filter.value, context),
      leftOperand: resolveInput(filter.stepOutputKey, context),
    }));

    const matchesFilter = evaluateFilterConditions({
      filterGroups: stepFilterGroups,
      filters: resolvedFilters,
    });

    return {
      result: {
        matchesFilter,
      },
      shouldEndWorkflowRun: !matchesFilter,
    };
  }
}
