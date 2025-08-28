import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { getMetadataNameValidators } from 'src/engine/metadata-modules/utils/constants/metadata-name-flat-metadata-validators.constants';

export const validateFlatFieldMetadataName = (
  name: string,
): FlatFieldMetadataValidationError[] =>
  getMetadataNameValidators().flatMap(({ validator, message }) => {
    const isInvalid = validator(name);

    if (isInvalid) {
      return {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message,
        userFriendlyMessage: message,
        value: name,
      };
    }

    return [];
  });
