import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const toRollupFieldMetadataValidationError = ({
  message,
  userFriendlyMessage,
}: Pick<
  FlatFieldMetadataValidationError,
  'message' | 'userFriendlyMessage'
>): FlatFieldMetadataValidationError => ({
  code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
  message,
  userFriendlyMessage,
});
