import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined, isEmptyObject, isPlainObject } from 'twenty-shared/utils';
import {
  computeStepFilterType,
  extractRawVariableNamePart,
  isBaseOutputSchemaV2,
  searchVariableInOutputSchema,
  TRIGGER_STEP_ID,
} from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// The trigger or a step a filter variable can point to, with the output schema that declares its variables
export type StepFilterVariableSource = {
  id: string;
  type: string;
  settings: { outputSchema?: unknown; expectedOutputSchema?: unknown };
};

export const buildStepFilterVariableSources = ({
  trigger,
  steps,
}: {
  trigger: Pick<StepFilterVariableSource, 'type' | 'settings'>;
  steps: WorkflowAction[];
}): StepFilterVariableSource[] => [
  { id: TRIGGER_STEP_ID, type: trigger.type, settings: trigger.settings },
  ...steps,
];

const getDeclaredOutputSchema = ({
  outputSchema,
  expectedOutputSchema,
}: StepFilterVariableSource['settings']): unknown => {
  if (isBaseOutputSchemaV2(outputSchema)) {
    return outputSchema;
  }

  return isPlainObject(expectedOutputSchema) &&
    !isEmptyObject(expectedOutputSchema)
    ? getOutputSchemaFromValue(expectedOutputSchema)
    : outputSchema;
};

const findVariableType = ({
  stepFilter,
  variableSources,
}: {
  stepFilter: StepFilter;
  variableSources: StepFilterVariableSource[];
}): string | undefined => {
  const stepId = extractRawVariableNamePart({
    rawVariableName: stepFilter.stepOutputKey,
    part: 'stepId',
  });

  const variableSource = variableSources.find(({ id }) => id === stepId);

  if (!isDefined(variableSource)) {
    return undefined;
  }

  return searchVariableInOutputSchema({
    schema: getDeclaredOutputSchema(variableSource.settings),
    stepType: variableSource.type,
    stepName: '',
    rawVariableName: stepFilter.stepOutputKey,
    isFullRecord: stepFilter.isFullRecord ?? false,
  }).variableType;
};

export const computeStepFilterTypeOrThrow = ({
  stepFilter,
  flatFieldMetadataMaps,
  variableSources,
}: {
  stepFilter: StepFilter;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  variableSources: StepFilterVariableSource[];
}): string => {
  if (!isDefined(stepFilter.fieldMetadataId)) {
    return computeStepFilterType({
      variableType: findVariableType({ stepFilter, variableSources }),
    });
  }

  const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: stepFilter.fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(flatFieldMetadata)) {
    throw new WorkflowStepExecutorException(
      `Filter ${stepFilter.id} is on field ${stepFilter.fieldMetadataId}, which does not exist`,
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );
  }

  return computeStepFilterType({ fieldMetadataType: flatFieldMetadata.type });
};
