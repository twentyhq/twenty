import { Injectable, Logger } from '@nestjs/common';

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
  private readonly logger = new Logger(FilterWorkflowAction.name);

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

    const { matchesFilter, hasUnresolvedFilterValue } = evaluateStepFilters({
      stepFilters,
      stepFilterGroups,
      context,
    });

    if (hasUnresolvedFilterValue) {
      this.logger.warn(
        `Filter step "${step.name}" has an unresolved filter value. Treating as no match.`,
      );
    }

    return {
      result: {
        matchesFilter,
      },
      shouldEndWorkflowRun: !matchesFilter,
      fallbackReason: hasUnresolvedFilterValue
        ? 'unresolved-filter-value'
        : undefined,
    };
  }
}
