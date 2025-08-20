
import { type FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { FlatObjectMetadataIdAndNames } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-id-and-names.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export const runFlatObjectMetadataValidators = <T>({
  elementToValidate,
  flatObjectMetadataIdAndNames: { id, namePlural, nameSingular },
  validators,
}: {
  elementToValidate: T;
  validators: FlatMetadataValidator<T>[];
  flatObjectMetadataIdAndNames: FlatObjectMetadataIdAndNames;
}): FailedFlatObjectMetadataValidation[] => {
  return validators.flatMap(({ validator, message }) => {
    const isInvalid = validator(elementToValidate);

    if (isInvalid) {
      return {
        error: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        id,
        namePlural,
        nameSingular,
        message,
        userFriendlyMessage: message,
      };
    }

    return [];
  });
};
