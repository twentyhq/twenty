import { Injectable, Logger } from '@nestjs/common';

import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isFilterValueUnresolved } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/is-filter-value-unresolved.util';
import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { findMatchingBranch } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/utils/find-matching-branch.util';

@Injectable()
export class IfElseWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(IfElseWorkflowAction.name);

  async execute(input: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const { currentStepId, steps, context } = input;

    const step = findStepOrThrow({
      steps,
      stepId: currentStepId,
    });

    if (!isWorkflowIfElseAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an if-else action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { stepFilterGroups, stepFilters, branches } = step.settings.input;

    if (!branches || branches.length === 0) {
      throw new WorkflowStepExecutorException(
        'If-else action must have at least one branch',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    if (!stepFilterGroups || !stepFilters) {
      throw new WorkflowStepExecutorException(
        'If-else action must have stepFilterGroups and stepFilters defined',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const resolvedFilters = stepFilters.map((filter) => ({
      ...filter,
      rightOperand: resolveInput(filter.value, context),
      leftOperand: resolveInput(filter.stepOutputKey, context),
    }));

    const hasUnresolvedFilterValue = resolvedFilters.some((filter) =>
      isFilterValueUnresolved({
        rightOperand: filter.rightOperand,
        operand: filter.operand,
      }),
    );

    if (hasUnresolvedFilterValue) {
      const defaultBranch = branches.find(
        (branch) => !isDefined(branch.filterGroupId),
      );

      if (!isDefined(defaultBranch)) {
        throw new WorkflowStepExecutorException(
          'No matching branch found in if-else action',
          WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
        );
      }

      this.logger.warn(
        `If-else step "${step.name}" has an unresolved filter value. Falling through to default branch "${defaultBranch.id}".`,
      );

      return {
        result: {
          matchingBranchId: defaultBranch.id,
        },
        fallbackReason: 'unresolved-filter-value',
      };
    }

    const matchingBranch = findMatchingBranch({
      branches,
      stepFilterGroups,
      resolvedFilters,
    });

    return {
      result: {
        matchingBranchId: matchingBranch.id,
      },
    };
  }
}
