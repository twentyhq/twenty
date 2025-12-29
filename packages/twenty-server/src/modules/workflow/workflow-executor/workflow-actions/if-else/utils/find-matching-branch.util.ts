import {
  type StepFilter,
  type StepFilterGroup,
  type StepIfElseBranch,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
  for (const branch of branches) {
    if (!isDefined(branch.filterGroupId)) {
      // ELSE branch - always matches (fallback)
      return branch;
    }

    // Get all filter groups that belong to this branch
    // (the root group + any nested groups)
    const branchFilterGroups = stepFilterGroups.filter(
      (group) =>
        group.id === branch.filterGroupId ||
        group.parentStepFilterGroupId === branch.filterGroupId,
    );

    // Get filters that belong to this branch's filter groups
    const branchFilterGroupIds = new Set(branchFilterGroups.map((g) => g.id));
    const branchFilters = resolvedFilters.filter((filter) =>
      branchFilterGroupIds.has(filter.stepFilterGroupId),
    );

    const matchesFilter = evaluateFilterConditions({
      filterGroups: branchFilterGroups,
      filters: branchFilters,
    });

    if (matchesFilter) {
      return branch;
    }
  }

  // This should never happen if branches are properly configured
  // (last branch should always be ELSE with no filterGroupId)
  throw new WorkflowStepExecutorException(
    'No matching branch found in if-else action',
    WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
  );
};
