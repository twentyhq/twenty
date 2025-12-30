import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type StepIfElseBranch } from 'twenty-shared/workflow';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

export type ResolvedFilter = Omit<StepFilter, 'value' | 'stepOutputKey'> & {
  rightOperand: unknown;
  leftOperand: unknown;
};

export const findMatchingBranch = ({
  branches,
  stepFilterGroups,
  resolvedFilters,
}: {
  branches: StepIfElseBranch[];
  stepFilterGroups: StepFilterGroup[];
  resolvedFilters: ResolvedFilter[];
}): StepIfElseBranch => {
  const matchingBranch = branches.find((branch) => {
    if (!isDefined(branch.filterGroupId)) {
      return true;
    }

    const branchFilterGroups = stepFilterGroups.filter(
      (group) =>
        group.id === branch.filterGroupId ||
        group.parentStepFilterGroupId === branch.filterGroupId,
    );

    const branchFilterGroupIds = new Set(branchFilterGroups.map((g) => g.id));
    const branchFilters = resolvedFilters.filter((filter) =>
      branchFilterGroupIds.has(filter.stepFilterGroupId),
    );

    return evaluateFilterConditions({
      filterGroups: branchFilterGroups,
      filters: branchFilters,
    });
  });

  if (!isDefined(matchingBranch)) {
    throw new WorkflowStepExecutorException(
      'No matching branch found in if-else action',
      WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
    );
  }

  return matchingBranch;
};
