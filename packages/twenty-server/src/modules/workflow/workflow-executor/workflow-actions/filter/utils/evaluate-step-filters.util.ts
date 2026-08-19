import { type StepFilter, type StepFilterGroup, ViewFilterOperand } from 'twenty-shared/types';
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
  const resolvedFilters = stepFilters.map((filter) => {
    const rightOperand = resolveInput(filter.value, context);
    const leftOperand = resolveInput(filter.stepOutputKey, context);

    if (
      !isDefined(rightOperand) &&
      filter.operand !== ViewFilterOperand.IS_EMPTY &&
      filter.operand !== ViewFilterOperand.IS_NOT_EMPTY
    ) {
      return {
        ...filter,
        rightOperand: undefined,
        leftOperand,
        operand: ViewFilterOperand.IS,
      };
    }

    return {
      ...filter,
      rightOperand,
      leftOperand,
    };
  });

  return evaluateFilterConditions({
    filterGroups: stepFilterGroups,
    filters: resolvedFilters,
  });
};
