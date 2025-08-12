import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export const runFlatFieldMetadataValidator = <T>(
  elementToValidate: T,
  { message, validator }: FlatMetadataValidator<T>,
): FailedFlatFieldMetadataValidationExceptions | undefined => {
  const isInvalid = validator(elementToValidate);

  if (isInvalid) {
    return new FieldMetadataException(
      message,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      {
        userFriendlyMessage: message,
      },
    );
  }
};
