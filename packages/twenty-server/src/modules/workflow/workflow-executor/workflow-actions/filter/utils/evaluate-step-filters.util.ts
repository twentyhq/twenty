import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type StepFilterVariableSource } from 'src/modules/workflow/workflow-executor/utils/compute-step-filter-type-or-throw.util';
import { resolveStepFilters } from 'src/modules/workflow/workflow-executor/utils/resolve-step-filters.util';
import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

export const evaluateStepFilters = ({
  stepFilters,
  stepFilterGroups,
  context,
  flatFieldMetadataMaps,
  variableSources,
}: {
  stepFilters: StepFilter[];
  stepFilterGroups: StepFilterGroup[];
  context: Record<string, unknown>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  variableSources: StepFilterVariableSource[];
}): boolean => {
  const resolvedFilters = resolveStepFilters({
    stepFilters,
    context,
    flatFieldMetadataMaps,
    variableSources,
  });

  return evaluateFilterConditions({
    filterGroups: stepFilterGroups,
    filters: resolvedFilters,
  });
};
