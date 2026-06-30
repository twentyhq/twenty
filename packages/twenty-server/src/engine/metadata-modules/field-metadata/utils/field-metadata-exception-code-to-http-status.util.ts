import { assertUnreachable } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

export const fieldMetadataExceptionCodeToHttpStatus = (
  code: keyof typeof FieldMetadataExceptionCode,
): number => {
  switch (code) {
    case FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND:
      return 404;
    case FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS:
      return 409;
    case FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED:
      return 403;
    case FieldMetadataExceptionCode.INVALID_FIELD_INPUT:
    case FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
    case FieldMetadataExceptionCode.APPLICATION_NOT_FOUND:
    case FieldMetadataExceptionCode.FIELD_METADATA_RELATION_NOT_ENABLED:
    case FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED:
    case FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION:
    case FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND:
    case FieldMetadataExceptionCode.RESERVED_KEYWORD:
    case FieldMetadataExceptionCode.NOT_AVAILABLE:
    case FieldMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL:
      return 400;
    case FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR:
      return 500;
    default:
      return assertUnreachable(code);
  }
};
