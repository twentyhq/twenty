import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-or-throw.utils';

export const validateMetadataName = (
  name: string,
): undefined | FieldMetadataException => {
  try {
    validateMetadataNameOrThrow(name);
  } catch (error) {
    return new FieldMetadataException(
      error.message,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      {
        userFriendlyMessage: error.userFriendlyMessage,
      },
    );
  }
};
