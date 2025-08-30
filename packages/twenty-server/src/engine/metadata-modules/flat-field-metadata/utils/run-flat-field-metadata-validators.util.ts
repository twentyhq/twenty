import { t } from '@lingui/core/macro';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export const runFlatFieldMetadataValidators = <T>({
  elementToValidate,
  validators,
}: {
  elementToValidate: T;
  validators: FlatMetadataValidator<T>[];
}): FlatFieldMetadataValidationError[] => {
  return validators.flatMap(({ validator, message }) => {
    const isInvalid = validator(elementToValidate);

    if (isInvalid) {
      return {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: t(message),
        value: elementToValidate,
      };
    }

    return [];
  });
};
