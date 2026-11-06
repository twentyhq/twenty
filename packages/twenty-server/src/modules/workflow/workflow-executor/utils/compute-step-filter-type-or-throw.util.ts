import { isNonEmptyString } from '@sniptt/guards';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  computeStepFilterType,
  extractRawVariableNamePart,
  searchVariableInOutputSchema,
} from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export type StepFilterVariableSource = {
  id: string;
  type: string;
  outputSchema: unknown;
};

const findVariableTypeOrThrow = ({
  stepFilter,
  variableSources,
}: {
  stepFilter: Pick<StepFilter, 'id' | 'stepOutputKey' | 'isFullRecord'>;
  variableSources: StepFilterVariableSource[];
}): string | undefined => {
  if (!isNonEmptyString(stepFilter.stepOutputKey)) {
    return undefined;
  }

  const stepId = extractRawVariableNamePart({
    rawVariableName: stepFilter.stepOutputKey,
    part: 'stepId',
  });

  const variableSource = variableSources.find(({ id }) => id === stepId);

  if (!isDefined(variableSource)) {
    throw new WorkflowStepExecutorException(
      `Filter ${stepFilter.id} reads ${stepFilter.stepOutputKey}, but step ${stepId} does not exist`,
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );
  }

  return searchVariableInOutputSchema({
    schema: variableSource.outputSchema,
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
  stepFilter: Pick<
    StepFilter,
    'id' | 'stepOutputKey' | 'isFullRecord' | 'fieldMetadataId'
  >;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  variableSources: StepFilterVariableSource[];
}): string => {
  if (!isDefined(stepFilter.fieldMetadataId)) {
    return computeStepFilterType({
      variableType: findVariableTypeOrThrow({ stepFilter, variableSources }),
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
