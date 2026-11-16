import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { buildUniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-universal-computed-field-schema-reader.util';
import { findFlatComputedFieldsReadingField } from 'src/engine/metadata-modules/computed-field/utils/find-flat-computed-fields-reading-field.util';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { getComputedFieldEvaluationError } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/get-computed-field-evaluation-error.util';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

// Refused instead of leaving a computed field that fails on every query
export const validateComputedFieldsStillEvaluateCrossEntity = ({
  optimisticUniversalFlatMaps: {
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  },
  orchestratorActionsReport,
}: {
  optimisticUniversalFlatMaps: Pick<
    AllUniversalFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
  >;
  orchestratorActionsReport: Pick<OrchestratorActionsReport, 'fieldMetadata'>;
}): Pick<OrchestratorFailureReport, 'fieldMetadata'> => {
  const validationErrors: Pick<OrchestratorFailureReport, 'fieldMetadata'> = {
    fieldMetadata: [],
  };

  const changedFieldUniversalIdentifiers = [
    ...orchestratorActionsReport.fieldMetadata.update,
    ...orchestratorActionsReport.fieldMetadata.delete,
  ].map(({ universalIdentifier }) => universalIdentifier);

  if (changedFieldUniversalIdentifiers.length === 0) {
    return validationErrors;
  }

  const computedFieldSchema = buildUniversalComputedFieldSchemaReader({
    flatObjectMetadataMaps,
    flatFieldMetadataMapsList: [flatFieldMetadataMaps],
  });

  // Only a field a computation is bound to can stop it from working
  for (const flatFieldMetadata of findFlatComputedFieldsReadingField({
    fieldUniversalIdentifiers: changedFieldUniversalIdentifiers,
    flatFieldMetadataMaps,
  })) {
    const evaluationError = getComputedFieldEvaluationError({
      flatFieldMetadata,
      ...computedFieldSchema,
    });

    if (!isDefined(evaluationError)) {
      continue;
    }

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatFieldMetadata.universalIdentifier,
        name: flatFieldMetadata.name,
        objectMetadataUniversalIdentifier:
          flatFieldMetadata.objectMetadataUniversalIdentifier,
      },
      metadataName: 'fieldMetadata',
      type: 'update',
    });

    failedValidation.errors.push({
      code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      message: `Computed field "${flatFieldMetadata.name}" would stop working: ${evaluationError}`,
      userFriendlyMessage: msg`A computed field reads this field. Update or delete the computed field first.`,
    });

    validationErrors.fieldMetadata.push(failedValidation);
  }

  return validationErrors;
};
