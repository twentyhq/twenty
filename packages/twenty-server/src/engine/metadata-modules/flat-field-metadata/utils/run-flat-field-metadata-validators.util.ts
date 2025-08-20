
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export const runFlatFieldMetadataValidators = <T>({
  elementToValidate,
  fieldMetadataNameIdObjectMetadataId: { id, name, objectMetadataId },
  validators,
}: {
  elementToValidate: T;
  validators: FlatMetadataValidator<T>[];
  fieldMetadataNameIdObjectMetadataId: FlatFieldMetadataIdObjectIdAndName;
}): FailedFlatFieldMetadataValidation[] => {
  return validators.flatMap(({ validator, message }) => {
    const isInvalid = validator(elementToValidate);

    if (isInvalid) {
      return {
        error: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        id,
        message,
        name,
        objectMetadataId,
        userFriendlyMessage: message,
        value: elementToValidate,
      };
    }

    return [];
  });
};