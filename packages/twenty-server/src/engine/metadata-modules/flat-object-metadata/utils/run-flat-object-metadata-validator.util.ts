import { type FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export const runFlatObjectMetadataValidator = <T>(
  elementToValidate: T,
  { message, validator }: FlatMetadataValidator<T>,
): FailedFlatObjectMetadataValidationExceptions | undefined => {
  const validationFailed = validator(elementToValidate);

  if (validationFailed) {
    return new ObjectMetadataException(
      message,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      {
        userFriendlyMessage: message,
      },
    );
  }
};
