import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { resolveInput } from 'twenty-shared/utils';

import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

// Resolves each filter's operands against the provided context (e.g. a workflow
// run context or a database event payload) and evaluates the filter conditions.
// Shared by the Filter action and the database event trigger so both express
// conditions the exact same way.
export const evaluateStepFilters = ({
  stepFilters,
  stepFilterGroups,
  context,
}: {
  stepFilters: StepFilter[];
  stepFilterGroups: StepFilterGroup[];
  context: Record<string, unknown>;
}): boolean => {
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
