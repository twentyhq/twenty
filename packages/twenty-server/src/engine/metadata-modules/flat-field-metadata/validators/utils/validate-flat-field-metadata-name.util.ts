import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  FailedFlatFieldMetadataValidation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';
import { METADATA_NAME_VALIDATORS } from 'src/engine/metadata-modules/utils/constants/metadata-name-flat-metadata-validators.constants';

export const validateFlatFieldMetadataName = ({
  id,
  name,
  objectMetadataId,
}: FlatFieldMetadataIdObjectIdAndName): FailedFlatFieldMetadataValidation[] =>
  METADATA_NAME_VALIDATORS.flatMap(({ validator, message }) => {
    const isInvalid = validator(name);

    if (isInvalid) {
      return {
        error: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        id,
        message,
        name,
        objectMetadataId,
        userFriendlyMessage: message,
      };
    }

    return [];
  });
