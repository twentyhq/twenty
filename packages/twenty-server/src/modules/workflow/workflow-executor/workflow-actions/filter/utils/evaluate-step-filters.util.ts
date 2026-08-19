import {
  type StepFilter,
  type StepFilterGroup,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined, resolveInput } from 'twenty-shared/utils';

import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

export const evaluateStepFilters = ({
  stepFilters,
  stepFilterGroups,
  context,
}: {
  stepFilters: StepFilter[];
  stepFilterGroups: StepFilterGroup[];
  context: Record<string, unknown>;
}): boolean => {
  const hasUnresolvedFilter = stepFilters.some((filter) => {
    const rightOperand = resolveInput(filter.value, context);

    return (
      !isDefined(rightOperand) &&
      filter.operand !== ViewFilterOperand.IS_EMPTY &&
      filter.operand !== ViewFilterOperand.IS_NOT_EMPTY
    );
  });

  if (hasUnresolvedFilter) {
    return false;
  }

  const resolvedFilters = stepFilters.map((filter) => ({
    ...filter,
    rightOperand: resolveInput(filter.value, context),
    leftOperand: resolveInput(filter.stepOutputKey, context),
  }));

  return evaluateFilterConditions({
    filterGroups: stepFilterGroups,
    filters: resolvedFilters,
  });
};
