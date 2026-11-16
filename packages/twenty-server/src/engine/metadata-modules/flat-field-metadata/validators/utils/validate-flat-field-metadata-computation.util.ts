import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';

import { COMPUTED_FIELD_KIND_DESCRIPTIONS } from 'src/engine/metadata-modules/computed-field/constants/computed-field-kind-descriptions.constant';
import { type UniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/universal-computed-field-schema-reader.type';
import { computeComputedFieldBindings } from 'src/engine/metadata-modules/computed-field/utils/compute-computed-field-bindings.util';
import { isFieldMetadataComputation } from 'src/engine/metadata-modules/computed-field/utils/is-field-metadata-computation.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { buildFlatFieldMetadataComputationValidationError } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/build-flat-field-metadata-computation-validation-error.util';
import { getComputedFieldEvaluationError } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/get-computed-field-evaluation-error.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const validateFlatFieldMetadataComputation = ({
  flatFieldMetadataToValidate,
  schemaReader,
  findObject,
}: {
  flatFieldMetadataToValidate: UniversalFlatFieldMetadata;
  schemaReader: UniversalComputedFieldSchemaReader;
  findObject: (
    objectUniversalIdentifier: string,
  ) => UniversalFlatObjectMetadata | undefined;
}): FlatFieldMetadataValidationError[] => {
  const { computation } = flatFieldMetadataToValidate;

  if (!isDefined(computation)) {
    return [];
  }

  const buildError = (message: string): FlatFieldMetadataValidationError[] => [
    buildFlatFieldMetadataComputationValidationError({
      flatFieldMetadata: flatFieldMetadataToValidate,
      message,
    }),
  ];

  if (!isFieldMetadataComputation(computation)) {
    return buildError(
      `it must be ${Object.values(COMPUTED_FIELD_KIND_DESCRIPTIONS)
        .map(({ readableShape }) => readableShape)
        .join(', or ')}`,
    );
  }

  if (
    flatFieldMetadataToValidate.isUnique ||
    flatFieldMetadataToValidate.isSearchable ||
    isDefined(flatFieldMetadataToValidate.defaultValue)
  ) {
    return buildError(
      'a computed field stores nothing: it cannot be unique, searchable or have a default value',
    );
  }

  const evaluationError = getComputedFieldEvaluationError({
    flatFieldMetadata: flatFieldMetadataToValidate,
    schemaReader,
    findObject,
  });

  if (isDefined(evaluationError)) {
    return buildError(evaluationError);
  }

  const object = findObject(
    flatFieldMetadataToValidate.objectMetadataUniversalIdentifier,
  );

  if (
    isDefined(object) &&
    !isEqual(
      computation.bindings,
      computeComputedFieldBindings({ computation, object, schemaReader }),
    )
  ) {
    return buildError(
      'its bindings are not the fields it reads; they are filled when the field is saved',
    );
  }

  return [];
};
