import { type StepFilter, type ViewFilterOperand } from 'twenty-shared/types';
import { resolveInput } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  computeStepFilterTypeOrThrow,
  type StepFilterVariableSource,
} from 'src/modules/workflow/workflow-executor/utils/compute-step-filter-type-or-throw.util';
import { resolveFilterValueAndOperand } from 'src/modules/workflow/workflow-executor/utils/resolve-filter-value-and-operand.util';

export type ResolvedStepFilter = Omit<
  StepFilter,
  'value' | 'stepOutputKey' | 'operand'
> & {
  type: string;
  operand: ViewFilterOperand;
  rightOperand: unknown;
  leftOperand: unknown;
};

export const resolveStepFilters = ({
  stepFilters,
  context,
  flatFieldMetadataMaps,
  variableSources,
}: {
  stepFilters: StepFilter[];
  context: Record<string, unknown>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  variableSources: StepFilterVariableSource[];
}): ResolvedStepFilter[] =>
  stepFilters.map(({ value, stepOutputKey, ...stepFilter }) => {
    const { value: rightOperand, operand } = resolveFilterValueAndOperand({
      value,
      operand: stepFilter.operand,
      context,
    });

    return {
      ...stepFilter,
      type: computeStepFilterTypeOrThrow({
        stepFilter: { ...stepFilter, value, stepOutputKey },
        flatFieldMetadataMaps,
        variableSources,
      }),
      operand,
      rightOperand,
      leftOperand: resolveInput(stepOutputKey, context),
    };
  });
