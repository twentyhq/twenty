import { Injectable } from '@nestjs/common';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowFilterAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/guards/is-workflow-filter-action.guard';
import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

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

    let matchesFilter: boolean;

    try {
      matchesFilter = evaluateStepFilters({
        stepFilters,
        stepFilterGroups,
        context,
      });
    } catch (error) {
      // Filter evaluation only fails on invalid filter configuration (e.g. a
      // legacy operand no evaluator supports). Surface it as a user error so
      // the run fails without being reported as a Twenty system error.
      throw new WorkflowStepExecutorException(
        error instanceof Error ? error.message : 'Failed to evaluate filter',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    return {
      result: {
        matchesFilter,
      },
      shouldEndWorkflowRun: !matchesFilter,
    };
  }
}
