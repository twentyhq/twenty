import { msg } from '@lingui/core/macro';
import { RECORD_OPERATIONS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

// Manifests are untrusted, so the stored value is checked as data rather than trusted as its type
export const validateFlatObjectMetadataDisabledRecordOperations = ({
  disabledRecordOperations,
}: {
  disabledRecordOperations: unknown;
}): FlatObjectMetadataValidationError[] => {
  if (!isDefined(disabledRecordOperations)) {
    return [];
  }

  if (!Array.isArray(disabledRecordOperations)) {
    return [
      {
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: 'Disabled record operations must be a list',
        userFriendlyMessage: msg`Disabled record operations must be a list`,
        value: disabledRecordOperations,
      },
    ];
  }

  const errors: FlatObjectMetadataValidationError[] = [];
  const recordOperations: readonly string[] = RECORD_OPERATIONS;

  for (const operation of disabledRecordOperations) {
    if (
      typeof operation !== 'string' ||
      !recordOperations.includes(operation)
    ) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `Unknown disabled record operation "${operation}"`,
        userFriendlyMessage: msg`Unknown disabled record operation`,
        value: operation,
      });
    }
  }

  if (
    new Set(disabledRecordOperations).size !== disabledRecordOperations.length
  ) {
    errors.push({
      code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: 'Disabled record operations must not repeat',
      userFriendlyMessage: msg`Disabled record operations must not repeat`,
      value: disabledRecordOperations,
    });
  }

  return errors;
};
