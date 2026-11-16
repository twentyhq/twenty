import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isString, isUndefined } from '@sniptt/guards';
import { FIELD_METADATA_ROLLUP_OPERATIONS } from 'twenty-shared/constants';
import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type UniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/universal-computed-field-schema-reader.type';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { getComputedFieldEvaluationError } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/get-computed-field-evaluation-error.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const isOptionalString = (value: unknown): value is string | undefined =>
  isUndefined(value) || isString(value);

// The computation comes from an API input or a manifest: nothing about its shape is known yet
const isFieldMetadataComputation = (
  computation: unknown,
): computation is FieldMetadataComputation => {
  if (!isPlainObject(computation)) {
    return false;
  }

  switch (computation.kind) {
    case 'FORMULA':
      return isString(computation.expression);
    case 'ROLLUP':
      return (
        isNonEmptyString(computation.relationFieldName) &&
        (FIELD_METADATA_ROLLUP_OPERATIONS as readonly unknown[]).includes(
          computation.operation,
        ) &&
        isOptionalString(computation.expression) &&
        isOptionalString(computation.filter)
      );
    default:
      return false;
  }
};

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
      'it must be a formula with an expression, or a rollup with a relation, an operation and optional expression and filter',
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

  return isDefined(evaluationError) ? buildError(evaluationError) : [];
};
