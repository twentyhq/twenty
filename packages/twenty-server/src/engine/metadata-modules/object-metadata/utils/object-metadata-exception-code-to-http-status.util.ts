import { assertUnreachable } from 'twenty-shared/utils';

import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const objectMetadataExceptionCodeToHttpStatus = (
  code: ObjectMetadataExceptionCode,
): number => {
  switch (code) {
    case ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return 404;
    case ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS:
      return 409;
    case ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED:
    case ObjectMetadataExceptionCode.NAME_CONFLICT:
      return 403;
    case ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT:
    case ObjectMetadataExceptionCode.MISSING_SYSTEM_FIELD:
    case ObjectMetadataExceptionCode.INVALID_SYSTEM_FIELD:
    case ObjectMetadataExceptionCode.MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD:
    case ObjectMetadataExceptionCode.APPLICATION_NOT_FOUND:
      return 400;
    case ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR:
    case ObjectMetadataExceptionCode.INVALID_ORM_OUTPUT:
      return 500;
    default:
      return assertUnreachable(code);
  }
};
