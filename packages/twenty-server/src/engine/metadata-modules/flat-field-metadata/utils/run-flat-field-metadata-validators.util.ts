
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export type FailedFlatFieldMetadataValidation = {
  error: string; // strictly type
  message: string;
  userFriendlyMessage?: string;
  value?: any; // TODO use generic
} & Pick<FlatFieldMetadata, 'id' | 'objectMetadataId' | 'name'>;

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