import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export const runFlatObjectMetadataValidators = <T>({
  elementToValidate,
  validators,
}: {
  elementToValidate: T;
  validators: FlatMetadataValidator<T>[];
}): FlatObjectMetadataValidationError[] => {
  return validators.flatMap(({ validator, message }) => {
    const isInvalid = validator(elementToValidate);

    if (isInvalid) {
      return {
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message,
        value: elementToValidate,
      };
    }

    return [];
  });
};
