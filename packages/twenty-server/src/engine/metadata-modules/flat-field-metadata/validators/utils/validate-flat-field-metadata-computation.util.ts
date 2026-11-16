import { msg } from '@lingui/core/macro';
import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';

import { COMPUTED_FIELD_KIND_DESCRIPTIONS } from 'src/engine/metadata-modules/computed-field/constants/computed-field-kind-descriptions.constant';
import { type UniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/universal-computed-field-schema-reader.type';
import { computeComputedFieldBindings } from 'src/engine/metadata-modules/computed-field/utils/compute-computed-field-bindings.util';
import { isFieldMetadataComputation } from 'src/engine/metadata-modules/computed-field/utils/is-field-metadata-computation.util';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { getComputedFieldEvaluationError } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/get-computed-field-evaluation-error.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const validateFlatFieldMetadataComputation = ({
  flatFieldMetadataToValidate,
  schemaReader,
  findObject,
  isComputedFieldsEnabled,
}: {
  flatFieldMetadataToValidate: UniversalFlatFieldMetadata;
  schemaReader: UniversalComputedFieldSchemaReader;
  findObject: (
    objectUniversalIdentifier: string,
  ) => UniversalFlatObjectMetadata | undefined;
  isComputedFieldsEnabled: boolean;
}): FlatFieldMetadataValidationError[] => {
  const { computation, name } = flatFieldMetadataToValidate;

  if (!isDefined(computation)) {
    return [];
  }

  const buildError = (message: string): FlatFieldMetadataValidationError[] => [
    {
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Invalid computation for field "${name}": ${message}`,
      userFriendlyMessage: msg`The computation of this field is invalid`,
      value: computation,
    },
  ];

  if (!isComputedFieldsEnabled) {
    return buildError('computed fields are not enabled for this workspace');
  }

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
