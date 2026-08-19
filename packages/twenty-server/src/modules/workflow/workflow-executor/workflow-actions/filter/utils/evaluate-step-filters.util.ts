import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { resolveInput } from 'twenty-shared/utils';

import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';
import { isFilterValueUnresolved } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/is-filter-value-unresolved.util';

export const evaluateStepFilters = ({
  stepFilters,
  stepFilterGroups,
  context,
}: {
  stepFilters: StepFilter[];
  stepFilterGroups: StepFilterGroup[];
  context: Record<string, unknown>;
}): {
  matchesFilter: boolean;
  hasUnresolvedFilterValue: boolean;
} => {
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
    return {
      matchesFilter: false,
      hasUnresolvedFilterValue: true,
    };
  }

  return {
    matchesFilter: evaluateFilterConditions({
      filterGroups: stepFilterGroups,
      filters: resolvedFilters,
    }),
    hasUnresolvedFilterValue: false,
  };
};
