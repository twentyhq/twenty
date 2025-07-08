import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';
import { isWorkflowFilterAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/guards/is-workflow-filter-action.guard';
import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

@Injectable()
export class FilterWorkflowAction implements WorkflowAction {
  async execute(input: WorkflowActionInput): Promise<WorkflowActionOutput> {
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

    const { filterGroups, filters } = step.settings.input;

    if (!filterGroups || !filters) {
      throw new WorkflowStepExecutorException(
        'Filter is not defined',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_SETTINGS,
      );
    }

    const resolvedFilters = filters.map((filter) => ({
      ...filter,
      rightOperand: resolveInput(filter.value, context),
      leftOperand: resolveInput(filter.stepOutputKey, context),
    }));

    const matchesFilter = evaluateFilterConditions({
      filterGroups,
      filters: resolvedFilters,
    });

    return {
      result: {
        matchesFilter,
      },
    };
  }
}
