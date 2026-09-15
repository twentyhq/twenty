import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';

import { resolveStepFilters } from 'src/modules/workflow/workflow-executor/utils/resolve-step-filters.util';

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
  const resolvedFilters = resolveStepFilters({ stepFilters, context });

  return evaluateFilterConditions({
    filterGroups: stepFilterGroups,
    filters: resolvedFilters,
  });
};
